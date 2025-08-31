const express = require("express");
const { updateStudio } = require("../controllers/StudioController");
const { verifyAccessToken } = require('../middleware/verifyToken') // to check token
const upload = require('../config/upload')
const router = express.Router();

// Update studio details
router.put("/:id",upload.single('logo') ,verifyAccessToken, updateStudio);

module.exports = router;
