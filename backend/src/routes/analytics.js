const express = require("express");
const controller = require("../controllers/analytics");

const router = express.Router();

router.get("/summary", controller.summary);

module.exports = router;
