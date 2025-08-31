const express = require('express');
const { createTask, getTaskByUser, getTask, deleteTask } = require('../controllers/TaskController')
const router = express.Router();

const { verifyAccessToken } = require('../middleware/verifyToken');



router.post('/create', verifyAccessToken, createTask);
router.get('/myTask', verifyAccessToken, getTaskByUser);
router.get('/', verifyAccessToken, getTask);
router.delete('/:id', verifyAccessToken, deleteTask);

module.exports = router