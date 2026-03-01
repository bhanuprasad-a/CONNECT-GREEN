const express = require('express');
const router = express.Router();
const recyclingController = require('../controllers/recyclingController');

// GET all nearby centers or filtered centers
router.get('/', recyclingController.getCenters);

// POST a new center (Optional utility)
router.post('/', recyclingController.createCenter);

module.exports = router;
