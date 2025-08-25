const express = require("express");
const { loginUser } = require("../handlers/loginController");

const router = express.Router();

router.route("/").post(loginUser);

module.exports = router;
