const { fetchUserTradeAnalytics } = require("../services/analyticService");

const getAnalytics = async (req, res, next) => {
	const userId = req.user.userId;
	try {
		const tradeAnalytics = await fetchUserTradeAnalytics(userId);
		res.status(200).json({
			success: true,
			data: tradeAnalytics,
			message: "Trade analytics fetched successfully",
		});
	} catch (error) {
		next(error);
	}
};

module.exports = { getAnalytics };
