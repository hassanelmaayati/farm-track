const express = require("express");
const controller = require("../controllers/exports");

const router = express.Router();

router.get("/animals.csv", controller.animals);
router.get("/logs.csv", controller.logs);
router.get("/health-report.csv", controller.healthReport);

module.exports = router;
