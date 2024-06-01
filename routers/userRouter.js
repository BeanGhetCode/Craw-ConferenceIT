const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đường dẫn đúng tới userController

// Đăng ký người dùng mới
router.get('/', userController.User)

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.post('/addToFollowList', userController.addToFollowList);

router.post('/deleteToFollowList', userController.deleteToFollowList);

router.get('/logout', userController.logoutUser);


module.exports = router;
