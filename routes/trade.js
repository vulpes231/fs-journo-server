const { Router } = require("express");
const {
	getUserTrades,
	getTradeInfo,
	createTrade,
	closeTrade,
} = require("../handlers/tradeController");
const { editTrade } = require("../services/tradeService");

const router = Router();

router.route("/").get(getUserTrades).post(createTrade);
router.route("/:tradeId").get(getTradeInfo).post(closeTrade).put(editTrade);

module.exports = router;
