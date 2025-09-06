const { Router } = require("express");
const {
	getUserWallets,
	getWalletInfo,
	updateBalance,
} = require("../handlers/walletController");
const router = Router();

router.route("/").get(getUserWallets);
router.route("/:walletId").get(getWalletInfo).post(updateBalance);

module.exports = router;
