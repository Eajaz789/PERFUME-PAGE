const express = require('express');
const { createSubscriber } = require('../controllers/subscriberController');

const router = express.Router();

// POST new subscriber
router.post('/', createSubscriber);

module.exports = router;
