const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đường dẫn đúng tới userController

// Đăng ký người dùng mới

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser)
// Đăng nhập người dùng

router.get('/',userController.User)

module.exports = router;
