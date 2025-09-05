const {
	addNewTrade,
	editTrade,
	endTrade,
	fetchTrade,
	fetchUserTrades,
} = require("../services/tradeService");

const createTrade = async (req, res, next) => {
	const userId = req.user.userId;
	const tradeData = req.body;
	try {
		await addNewTrade(userId, tradeData);
		res.status(201).json({
			message: "Trade added successfully.",
			data: null,
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const updateTrade = async (req, res, next) => {
	const { tradeId } = req.params;
	const tradeData = req.body;
	try {
		await editTrade(tradeId, tradeData);
		res.status(200).json({
			message: "Trade updated successfully.",
			data: null,
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const closeTrade = async (req, res, next) => {
	const userId = req.user.userId;
	const { tradeId } = req.params;
	try {
		await endTrade(tradeId, { ...req.body, userId });
		res.status(200).json({
			message: "Trade closed successfully.",
			data: null,
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const getTradeInfo = async (req, res, next) => {
	const { tradeId } = req.params;
	try {
		const trade = await fetchTrade(tradeId);
		res.status(200).json({
			message: "Trade info fetched successfully.",
			data: trade,
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

const getUserTrades = async (req, res, next) => {
	const userId = req.user.userId;
	const limit = Math.min(15, parseFloat(req.query.limit) || 15);
	const page = Math.max(1, parseFloat(req.query.page) || 1);
	const sortBy = req.query.sortBy;
	const filterBy = req.query.filterBy;
	const filterValue = req.query.filterValue;
	try {
		const { userTrades, totalPages, totalTrades, currentPage } =
			await fetchUserTrades(userId, {
				limit,
				page,
				sortBy,
				filterBy,
				filterValue,
			});
		// console.log(userTrades);
		res.status(200).json({
			message: "User trades fetched successfully.",
			data: userTrades,
			success: true,
			pagination: {
				totalPages,
				totalTrades,
				currentPage,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createTrade,
	updateTrade,
	closeTrade,
	getTradeInfo,
	getUserTrades,
};
