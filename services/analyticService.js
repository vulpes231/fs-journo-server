const Trade = require("../models/Trade");
const { HttpError } = require("../utils/utils");

async function fetchUserTradeAnalytics(userId) {
	try {
		const userTrades = await Trade.find({ userId });

		const openTrades = userTrades.filter(
			(trade) => trade.performance.status === "open"
		);

		const closedTrades = userTrades.filter(
			(trade) => trade.performance.status === "closed"
		);

		const tradesWon = userTrades.filter(
			(trade) => trade.performance.result === "won"
		);
		const tradesLost = userTrades.filter(
			(trade) => trade.performance.result === "loss"
		);

		const winningRate =
			userTrades.length > 0 ? (tradesWon.length / userTrades.length) * 100 : 0;

		const profit =
			tradesWon.length > 0
				? tradesWon.reduce(
						(acc, trade) => acc + (trade.performance?.totalReturn || 0),
						0
				  )
				: 0;

		const loss =
			tradesLost.length > 0
				? tradesLost.reduce(
						(acc, trade) => acc + (trade.performance?.totalReturn || 0),
						0
				  )
				: 0;

		// console.log(loss);

		const tradeAnalytics = {
			totalTrades: userTrades.length,
			totalOpen: openTrades.length,
			totalClosed: closedTrades.length,
			totalWins: tradesWon.length,
			winRate: parseFloat(winningRate.toFixed(2)),
			totalProfit: profit,
			totalLoss: loss,
		};

		return tradeAnalytics;
	} catch (error) {
		throw new HttpError("Failed to fetch user trade analytics", 500);
	}
}

module.exports = { fetchUserTradeAnalytics };
