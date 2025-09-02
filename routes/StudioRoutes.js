const express = require("express");
const { updateStudio, getStudio } = require("../controllers/StudioController");
const { verifyAccessToken } = require('../middleware/verifyToken') // to check token
const upload = require('../config/upload')
const router = express.Router();

// Update studio details
router.put("/:id", upload.single('logo'), verifyAccessToken, updateStudio);
router.get("/", verifyAccessToken, getStudio);

module.exports = router;
