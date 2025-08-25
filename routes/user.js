const express = require("express");
const {
	getUser,
	updateUser,
	changePassword,
} = require("../handlers/userController");

const router = express.Router();

router.route("/").get(getUser).put(updateUser);
router.route("/update-password").post(changePassword);

module.exports = router;
