const express = require("express");
const controller = require("../controllers/logs");
const validateId = require("../middleware/validateId");

const router = express.Router();
router.param("id", validateId);

router.get("/", controller.listAll);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
