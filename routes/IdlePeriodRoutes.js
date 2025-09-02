const express = require('express');
const { verifyAccessToken } = require('../middleware/verifyToken');
const { applyIdlePeriod, getMyIdlePeriods, getAllIdlePeriods, updateIdlePeriodStatus } = require('../controllers/IdlePeriodController');
const upload = require('../config/upload')
const { isStaff } = require('../middleware/RoleCheck')

const router = express.Router();


router.post('/apply', verifyAccessToken, upload.single('document'), applyIdlePeriod);


router.get('/my', verifyAccessToken, getMyIdlePeriods);


router.get('/all', verifyAccessToken, isStaff, getAllIdlePeriods);
router.put('/status/:id', verifyAccessToken, isStaff, updateIdlePeriodStatus);


module.exports = router;
