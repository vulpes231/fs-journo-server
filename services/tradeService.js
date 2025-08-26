const Trade = require("../models/Trade");
const { HttpError } = require("../utils/utils");
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
		const tradeData = {
			asset: asset,
			orderType: orderType,
			riskRatio: riskRatio || null,
			userId: userId,
			wallet: {
				id: wallet._id,
				name: wallet.name,
			},
			execution: {
				entry: entry || null,
				stopLoss: stopLoss || null,
				takeProfit: takeProfit || null,
				lotSize: lotSize || null,
			},
		};
		const newTrade = await Trade.create(tradeData);
		return newTrade;
	} catch (error) {
		throw new HttpError("Failed to add trade! Try again.", 500);
	}
}

async function editTrade(tradeId, tradeData) {
	if (!tradeId) throw new HttpError("Bad request!", 400);
	const { riskRatio, entry, stopLoss, takeProfit, status, lotSize } = tradeData;

	try {
		const trade = await Trade.findById(tradeId);
		if (!trade) throw new HttpError("Trade not found!", 404);

		if (riskRatio) trade.riskRatio = riskRatio;
		if (status) trade.status = status;
		if (entry) trade.execution.entry = entry;
		if (stopLoss) trade.execution.stopLoss = stopLoss;
		if (lotSize) trade.execution.lotSize = lotSize;
		if (takeProfit) trade.execution.takeProfit = takeProfit;

		await trade.save();

		return trade;
	} catch (error) {
		throw new HttpError("Failed to update trade! Try again.", 500);
	}
}

async function endTrade(tradeId, tradeData) {
	if (!tradeId) throw new HttpError("Bad request!", 400);
	const { result, totalReturn } = tradeData;
	if (!result) throw new HttpError("Result required!", 400);
	try {
		let parsedReturn;
		if (totalReturn) parsedReturn = parseFloat(totalReturn);

		const trade = await Trade.findById(tradeId);
		if (!trade) throw new HttpError("Trade not found!", 404);

		const wallet = fetchWallet(trade.wallet.id);
		if (!wallet) throw new HttpError("Wallet not found!", 404);

		if (totalReturn) trade.execution.totalReturn = parsedReturn;

		wallet.balance += trade.execution.totalReturn;
		await wallet.save();

		trade.result = result;
		trade.status = "closed";
		trade.execution.closedAt = Date.now();
		await trade.save();

		return trade;
	} catch (error) {
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

module.exports = { addNewTrade, editTrade, endTrade, fetchUserTrades };
