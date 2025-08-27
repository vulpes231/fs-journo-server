const express = require("express");
const {
	getUser,
	updateUser,
	changePassword,
	logoutUser,
} = require("../handlers/userController");

const router = express.Router();

router.route("/").get(getUser).put(updateUser);
router.route("/update-password").post(changePassword);
router.route("/logout").post(logoutUser);

module.exports = router;
