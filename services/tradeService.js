const Trade = require("../models/Trade");
const { HttpError, calculatePipValue } = require("../utils/utils");
const { fetchWallet } = require("./walletService");

async function addNewTrade(userId, tradeData) {
	if (!userId) throw new HttpError("Bad request!", 400);
	const {
		asset,
		orderType,
		riskRatio,
		entry,
		stopLoss,
		takeProfit,
		lotSize,
		walletId,
	} = tradeData;

	if (!asset || !orderType || !entry)
		throw new HttpError("Fill required fields!", 400);

	try {
		const wallet = await fetchWallet(walletId);
		if (!wallet) throw new HttpError("Wallet not found!", 404);

		// --- calculate pip value ---
		const pipValue = calculatePipValue(
			asset,
			Number(lotSize),
			entry,
			wallet.currency
		);

		// --- stop loss / take profit distances (in pips or points) ---
		let stopLossPips = stopLoss
			? Math.abs(entry - stopLoss) /
			  (asset.includes("JPY") ? 0.01 : asset === "XAU/USD" ? 0.01 : 0.0001)
			: 0;
		let takeProfitPips = takeProfit
			? Math.abs(entry - takeProfit) /
			  (asset.includes("JPY") ? 0.01 : asset === "XAU/USD" ? 0.01 : 0.0001)
			: 0;

		// --- usd values ---
		const stopLossUsd = stopLossPips * pipValue;
		const takeProfitUsd = takeProfitPips * pipValue;

		const tradeDoc = {
			asset: asset,
			orderType: orderType,
			risk: {
				ratio: riskRatio || null,
			},
			userId: userId,
			wallet: {
				id: wallet._id,
				name: wallet.name,
			},
			execution: {
				entry: entry,
				stopLoss: {
					point: stopLoss || null,
					usdValue: stopLossUsd || 0,
				},
				takeProfit: {
					point: takeProfit || null,
					usdValue: takeProfitUsd || 0,
				},
				lotSize: lotSize || null,
			},
		};

		const newTrade = await Trade.create(tradeDoc);
		return newTrade;
	} catch (error) {
		console.error(error);
		throw new HttpError("Failed to add trade! Try again.", 500);
	}
}

async function editTrade(tradeId, tradeData) {
	if (!tradeId) throw new HttpError("Bad request!", 400);
	const { stopLoss, takeProfit } = tradeData;

	try {
		const trade = await Trade.findById(tradeId);
		if (!trade) throw new HttpError("Trade not found!", 404);

		if (stopLoss) trade.execution.stopLoss = stopLoss;
		if (takeProfit) trade.execution.takeProfit = takeProfit;

		await trade.save();

		return trade;
	} catch (error) {
		throw new HttpError("Failed to update trade! Try again.", 500);
	}
}

async function endTrade(tradeId, tradeData) {
	if (!tradeId) throw new HttpError("Bad request!", 400);
	const { closePrice, userId } = tradeData;

	if (!userId) throw new HttpError("Bad request!", 400);
	if (!closePrice) throw new HttpError("Closing price required!", 400);

	try {
		// --- find trade ---
		const trade = await Trade.findById(tradeId);
		if (!trade) throw new HttpError("Trade not found!", 404);

		if (trade.userId.toString() !== userId.toString()) {
			throw new HttpError("Not allowed!", 403);
		}

		// --- fetch wallet ---
		const wallet = await fetchWallet(trade.wallet.id);
		if (!wallet) throw new HttpError("Wallet not found!", 404);

		// --- calculate profit/loss ---
		const { entry, lotSize } = trade.execution;
		const pipValue = calculatePipValue(
			trade.asset,
			Number(lotSize),
			entry,
			wallet.currency
		);

		const pipSize = trade.asset.includes("JPY")
			? 0.01
			: trade.asset === "XAU/USD"
			? 0.01
			: ["US30", "NAS100", "NASDAQ"].includes(trade.asset)
			? 1
			: 0.0001;

		// price movement in pips
		const pipsMoved = Math.abs(entry - closePrice) / pipSize;
		const usdMoved = pipsMoved * pipValue;

		// profit/loss depending on buy/sell
		let totalReturn;
		if (trade.orderType === "buy") {
			totalReturn = closePrice > entry ? usdMoved : -usdMoved;
		} else {
			totalReturn = closePrice < entry ? usdMoved : -usdMoved;
		}

		// --- update wallet ---
		wallet.balance += totalReturn;
		await wallet.save();

		// --- set trade performance ---
		trade.performance.totalReturn = totalReturn;
		trade.performance.closePrice = closePrice;
		trade.performance.closedAt = Date.now();
		trade.performance.status = "closed";

		// --- result status ---
		if (totalReturn > 0) trade.performance.result = "won";
		else if (totalReturn < 0) trade.performance.result = "lost";
		else trade.performance.result = "break even";

		await trade.save();

		return trade;
	} catch (error) {
		console.error(error);
		throw new HttpError("Failed to close trade! Try again.", 500);
	}
}

async function fetchUserTrades(userId, queryData = {}) {
	if (!userId) throw new HttpError("Bad request!", 400);

	const { sortBy, filterBy, filterValue, page, limit } = queryData;

	try {
		// Sorting
		const sort = {};
		if (sortBy) sort[sortBy] = -1; // e.g. { status: -1 }

		// Filtering
		const filter = { userId };
		if (filterBy && filterValue !== undefined) {
			filter[filterBy] = filterValue;
		}

		// Query trades
		const userTrades = await Trade.find(filter)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(limit);

		const totalTrades = await Trade.countDocuments(filter);
		const totalPages = Math.ceil(totalTrades / limit);

		return {
			userTrades,
			totalTrades,
			totalPages,
			currentPage: page,
		};
	} catch (error) {
		throw new HttpError("Failed to fetch user trades!", 500);
	}
}

async function fetchTrade(tradeId) {
	if (!tradeId) throw new HttpError("Bad request!", 400);
	try {
		const trade = await Trade.findById(tradeId);
		if (!trade) throw new HttpError("Trade not found!", 404);

		return trade;
	} catch (error) {
		throw new HttpError("Failed to fetch user trades!", 500);
	}
}

module.exports = {
	addNewTrade,
	editTrade,
	endTrade,
	fetchUserTrades,
	fetchTrade,
};
