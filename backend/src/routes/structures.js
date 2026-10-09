const express = require("express");
const controller = require("../controllers/structures");
const validateId = require("../middleware/validateId");

const router = express.Router();
router.param("id", validateId);

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.show);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
