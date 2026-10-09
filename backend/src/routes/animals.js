const express = require("express");
const controller = require("../controllers/animals");
const logs = require("../controllers/logs");
const validateId = require("../middleware/validateId");

const router = express.Router();
router.param("id", validateId);
router.param("animalId", validateId);

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/species", controller.species);

// Declared before "/:id" so "bulk" is never read as an id.
router.post("/bulk/move", controller.bulkMove);
router.post("/bulk/status", controller.bulkStatus);
router.post("/bulk/delete", controller.bulkRemove);

router.get("/:id", controller.show);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

router.get("/:animalId/logs", logs.listForAnimal);
router.post("/:animalId/logs", logs.create);

module.exports = router;
