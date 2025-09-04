const { Router } = require("express");
const {
	createAsset,
	getAssets,
	updateAsset,
} = require("../handlers/assetController");

const router = Router();

router.route("/").post(createAsset).get(getAssets);
router.route("/:assetId").put(updateAsset);

module.exports = router;
