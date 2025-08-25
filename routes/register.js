const express = require("express");
const { createNewUser } = require("../handlers/registerController");

const router = express.Router();

router.route("/").post(createNewUser);

module.exports = router;
