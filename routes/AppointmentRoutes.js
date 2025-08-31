const express = require('express');
const {
    getAppointments,
    myAppointments,
    createAppointment,
    deleteAppointment,
    updateAppointmentById,
    cancelAppointment,
    confirmedAppointment
} = require('../controllers/AppointmentController');
const { isAdmin, isStaff } = require('../middleware/RoleCheck');
const { verifyAccessToken } = require('../middleware/verifyToken');
const router = express.Router();

// Admin / Staff Routes
router.get('/', verifyAccessToken, isAdmin, isStaff, getAppointments);
router.post('/create', verifyAccessToken, isStaff, createAppointment);
router.put('/:id', verifyAccessToken, isStaff, updateAppointmentById);
router.delete('/:id', verifyAccessToken, isStaff, deleteAppointment);

// Member Routes
router.get('/myAppointments', verifyAccessToken, myAppointments);
router.patch('/cancel/:id', verifyAccessToken, cancelAppointment);
router.patch('/confirm/:id', verifyAccessToken, confirmedAppointment);

module.exports = router;
