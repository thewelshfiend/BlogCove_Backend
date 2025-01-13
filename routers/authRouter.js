const express = require("express");

const { isAuth } = require("../middlewares/authMiddleware");
const { registerController, loginController, logoutController } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/logout", isAuth, logoutController);

module.exports = router;