'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

router.get('/', controller.showHomepage);
router.post('/addToFollowList', controller.addToFollowList);

module.exports = router;
