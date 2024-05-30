const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đường dẫn đúng tới userController

// Đăng ký người dùng mới
router.post('/register', userController.registerUser);

// Đăng nhập người dùng
router.post('/login', userController.loginUser);

module.exports = router;
