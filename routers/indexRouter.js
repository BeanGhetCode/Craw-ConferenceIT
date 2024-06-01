// Truyền session xuống controller
const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');


router.get('/', controller.showHomepage);



module.exports = router;
