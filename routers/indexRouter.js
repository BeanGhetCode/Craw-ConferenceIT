// Truyền session xuống controller
const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

// Định tuyến yêu cầu GET đến showHomepage trong controller
router.get('/', controller.showHomepage);
// Định tuyến yêu cầu POST đến addToFollowList trong controller
router.post('/addToFollowList', controller.addToFollowList);

module.exports = router;
