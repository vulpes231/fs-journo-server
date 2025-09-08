const { Router } = require("express");
const {
	getUserTrades,
	getTradeInfo,
	createTrade,
	closeTrade,
	updateTrade,
} = require("../handlers/tradeController");

const router = Router();

router.route("/").get(getUserTrades).post(createTrade);
router.route("/:tradeId").get(getTradeInfo).post(closeTrade).put(updateTrade);

module.exports = router;
