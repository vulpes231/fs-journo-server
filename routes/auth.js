const express = require("express");
const { loginUser } = require("../handlers/authController");

const router = express.Router();

router.route("/").post(loginUser);

module.exports = router;
