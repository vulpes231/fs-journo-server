const { Router } = require("express");
const {
	getUserWallets,
	getWalletInfo,
} = require("../handlers/walletController");
const router = Router();

router.route("/").get(getUserWallets);
router.route("/:walletId").get(getWalletInfo);

module.exports = router;
