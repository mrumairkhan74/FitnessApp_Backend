const express = require('express');
const { getRelations, getRelationsById, createRelation, deleteRelation, } = require('../controllers/RelationController');
const { isAdmin,isStaff } = require('../middleware/RoleCheck')
const { verifyAccessToken } = require('../middleware/verifyToken');
const router = express.Router();

router.get('/', verifyAccessToken, isAdmin, getRelations)
router.get('/myRelations', verifyAccessToken, isStaff, getRelationsById)
router.post('/create', verifyAccessToken, isStaff, createRelation)

router.delete('/:id', verifyAccessToken,isStaff, deleteRelation)

module.exports = router;