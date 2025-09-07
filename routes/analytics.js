const { Router } = require("express");
const { getAnalytics } = require("../handlers/analyticsController");

const router = Router();

router.route("/").get(getAnalytics);

module.exports = router;
