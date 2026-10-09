const express = require("express");
const controller = require("../controllers/auth");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/signup", authLimiter, controller.signup);
router.post("/login", authLimiter, controller.login);
router.post("/logout", controller.logout);
router.get("/me", requireAuth, controller.me);

module.exports = router;
