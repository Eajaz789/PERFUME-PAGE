const express = require('express');
const { createContact } = require('../controllers/contactController');

const router = express.Router();

// POST contact form
router.post('/', createContact);

module.exports = router;
