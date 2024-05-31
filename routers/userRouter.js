const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đường dẫn đúng tới userController

// Đăng ký người dùng mới
router.get('/', userController.User)
router.post('/register', userController.registerUser);

// Route for user login
router.post('/login', userController.loginUser);
// Đăng nhập người dùng
router.get('/logout', userController.logoutUser);
//router.get('/',userController.User)

module.exports = router;
