const { default: mongoose } = require("mongoose");
const Trade = require("../models/Trade");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { HttpError, calculatePipValue } = require("../utils/utils");
const { fetchAssetById } = require("./assetService");
const { fetchWallet } = require("./walletService");
const { getUserInfo } = require("./userService");

async function addNewTrade(userId, tradeData) {
	if (!userId) throw new HttpError("Bad request!", 400);
	const {
		assetId,
		orderType,
		riskRatio,
		entry,
		stopLoss,
		takeProfit,
		lotSize,
		walletId,
	} = tradeData;

	if (!assetId || !orderType || !entry)
		throw new HttpError("Fill required fields!", 400);

	try {
		const user = await getUserInfo(userId);
		if (!user) throw new HttpError("User not found!", 404);
		const assetInfo = await fetchAssetById(assetId);
		const wallet = await fetchWallet(walletId);
		if (!wallet) throw new HttpError("Wallet not found!", 404);

		// --- calculate pip value ---
		const pipValue = calculatePipValue(
			assetInfo.name,
			Number(lotSize),
			entry,
			user.currency
		);

		// --- stop loss / take profit distances (in pips or points) ---
		let stopLossPips = stopLoss
			? Math.abs(entry - stopLoss) /
			  (assetInfo.name.includes("jpy")
					? 0.01
					: assetInfo.name === "xau/usd"
					? 0.01
					: 0.0001)
			: 0;
		let takeProfitPips = takeProfit
			? Math.abs(entry - takeProfit) /
			  (assetInfo.name.includes("jpy")
					? 0.01
					: assetInfo.name === "xau/usd"
					? 0.01
					: 0.0001)
			: 0;

		// --- usd values ---
		const stopLossUsd = stopLossPips * pipValue;
		const takeProfitUsd = takeProfitPips * pipValue;

		if (wallet.balance < stopLossUsd)
			throw new HttpError("Insufficient funds!", 404);

		const tradeDoc = {
			asset: assetInfo.name,
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

	// ensure incoming tradeId is a valid ObjectId to avoid BSON casting errors
	if (!mongoose.Types.ObjectId.isValid(tradeId)) {
		throw new HttpError("Invalid trade id!", 400);
	}

	const { stopLoss, takeProfit } = tradeData ?? {};

	try {
		const trade = await Trade.findById(tradeId);
		if (!trade) throw new HttpError("Trade not found!", 404);

		const user = await getUserInfo(trade.userId);
		if (!user) throw new HttpError("user not found!", 404);

		// ensure trade has a wallet id and it's a valid ObjectId
		if (!trade.wallet || !trade.wallet.id) {
			throw new HttpError("Missing wallet id in trade record!", 400);
		}
		if (!mongoose.Types.ObjectId.isValid(String(trade.wallet.id))) {
			throw new HttpError("Invalid wallet id in trade record!", 400);
		}

		const userWallet = await Wallet.findById(trade.wallet.id);
		if (!userWallet) throw new HttpError("Wallet not found!", 404);

		// parse important numeric fields
		const entry = Number(trade.execution?.entry);
		if (!Number.isFinite(entry))
			throw new HttpError("Invalid entry price in trade record!", 400);

		const lotSizeNum = Number(trade.execution?.lotSize) || 1;

		// get pip value from your helper (expects symbol, lotSize, price, currency)
		const pipValue = calculatePipValue(
			trade.asset,
			lotSizeNum,
			entry,
			user.currency
		);
		if (!Number.isFinite(pipValue) || pipValue <= 0) {
			// allow very small pipValue if valid, but protect against NaN/zero
			throw new HttpError("Invalid pip value for recalculation!", 500);
		}

		// normalize symbol and determine pip size (point size)
		const symbol = String(trade.asset ?? "").toUpperCase();
		const pipSize = symbol.includes("JPY")
			? 0.01
			: symbol === "XAU/USD"
			? 0.01
			: ["US30", "NAS100", "NASDAQ"].includes(symbol)
			? 1
			: 0.0001;

		// update stop loss if provided
		if (
			stopLoss !== undefined &&
			stopLoss !== null &&
			String(stopLoss).trim() !== ""
		) {
			const parsedSl = parseFloat(stopLoss);
			if (!Number.isFinite(parsedSl))
				throw new HttpError("Invalid stopLoss value!", 400);

			const stopLossPips = Math.abs(entry - parsedSl) / pipSize;
			const stopLossUsd = stopLossPips * pipValue;

			// store numbers (rounded to 2 decimals for USD)
			trade.execution.stopLoss.point = parsedSl;
			trade.execution.stopLoss.usdValue = parseFloat(stopLossUsd).toFixed(2);
		}

		// update take profit if provided
		if (
			takeProfit !== undefined &&
			takeProfit !== null &&
			String(takeProfit).trim() !== ""
		) {
			const parsedTp = parseFloat(takeProfit);
			if (!Number.isFinite(parsedTp))
				throw new HttpError("Invalid takeProfit value!", 400);

			const takeProfitPips = Math.abs(entry - parsedTp) / pipSize;
			const takeProfitUsd = takeProfitPips * pipValue;

			trade.execution.takeProfit.point = parsedTp;
			trade.execution.takeProfit.usdValue =
				parseFloat(takeProfitUsd).toFixed(2);
		}

		await trade.save();
		return trade;
	} catch (error) {
		console.error(error);
		throw new HttpError("Failed to update trade! Try again.", 500);
	}
}

async function endTrade(tradeId, tradeData) {
	if (!tradeId) throw new HttpError("Bad request!", 400);
	const { closePrice, userId } = tradeData;

	if (!userId) throw new HttpError("Bad request!", 400);
	if (!closePrice) throw new HttpError("Closing price required!", 400);

	try {
		const user = await getUserInfo(userId);
		if (!user) throw new HttpError("user not found!", 404);
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
			user.currency
		);

		const symbol = String(trade.asset ?? "").toUpperCase();
		const pipSize = symbol.includes("JPY")
			? 0.01
			: symbol === "XAU/USD"
			? 0.01
			: ["US30", "NAS100", "NASDAQ"].includes(symbol)
			? 1
			: 0.0001;

		// price movement in pips
		const pipsMoved = Math.abs(entry - parseFloat(closePrice)) / pipSize;
		const usdMoved = pipsMoved * pipValue;

		// profit/loss depending on buy/sell
		let totalReturn;
		if (trade.orderType === "buy") {
			totalReturn = parseFloat(closePrice) > entry ? usdMoved : -usdMoved;
		} else {
			totalReturn = parseFloat(closePrice) < entry ? usdMoved : -usdMoved;
		}

		// --- update wallet ---
		wallet.balance += totalReturn;
		await wallet.save();

		// --- set trade performance ---
		trade.performance.totalReturn = parseFloat(totalReturn).toFixed(2);
		trade.performance.closePrice = closePrice;
		trade.performance.closedAt = Date.now();
		trade.performance.status = "closed";

		// --- result status ---
		if (totalReturn > 0) trade.performance.result = "won";
		else if (totalReturn < 0) trade.performance.result = "loss";
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
		const PAGESET = Math.max(1, parseInt(page));
		const LIMITSET = Math.min(50, parseInt(limit)); // protect against huge requests

		// Sorting
		const sort = {};
		if (sortBy) {
			// handle aliasing for nested paths
			if (sortBy === "status") sort["performance.status"] = -1;
			else sort[sortBy] = -1;
		}

		// Filtering
		const filter = { userId };
		if (filterBy && filterValue !== undefined) {
			if (filterBy === "status") filter["performance.status"] = filterValue;
			else filter[filterBy] = filterValue;
		}

		// Query trades
		const userTrades = await Trade.find(filter)
			.sort(sort)
			.skip((PAGESET - 1) * LIMITSET)
			.limit(LIMITSET);

		const totalTrades = await Trade.countDocuments(filter);
		const totalPages = Math.ceil(totalTrades / LIMITSET);

		return {
			userTrades,
			totalTrades,
			totalPages,
			currentPage: PAGESET,
		};
	} catch (error) {
		throw new HttpError(error.message, error.statusCode);
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
