const express = require("express");

const router = express.Router();

const userController = require("../controllers/user");
const authMiddleware = require("../middleware/is-auth");

//3주
router.post("/getUser", authMiddleware.isLogin, userController.getUser);

router.post("/updateUser", authMiddleware.isLogin, userController.updateUser);

router.post("/updateThumbnail", authMiddleware.isLogin, userController.updateThumbnail);

module.exports = router;
