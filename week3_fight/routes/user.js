const express = require("express");

const router = express.Router();

const userController = require("../controllers/user");
const authMiddleware = require("../middleware/is-auth");
var multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
var upload = multer({ dest: 'uploads/' })

//3주
router.post("/getUser", authMiddleware.isLogin, userController.getUser);

router.post("/updateUser", authMiddleware.isLogin, userController.updateUser);

router.post("/edit-profile", upload.single('image'), authMiddleware.isLogin, userController.updateThumbnail);

module.exports = router;