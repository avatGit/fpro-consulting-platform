const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../validators/authValidators');
const { createMaintenanceSchema, assignTechnicianSchema } = require('../validators/maintenanceValidators');

router.use(authenticate);

router.post('/', authorize('client'), validate(createMaintenanceSchema), maintenanceController.createRequest);
router.get('/', maintenanceController.listUserRequests);

// Routes Admin & Agent
router.get('/all', authorize('admin', 'agent'), maintenanceController.listAllRequests);
router.get('/technicians/available', authorize('admin', 'agent'), maintenanceController.listAvailableTechnicians);
router.post('/:id/assign', authorize('admin', 'agent'), validate(assignTechnicianSchema), maintenanceController.assignTechnician);
router.post('/:id/auto-assign', authorize('admin', 'agent'), maintenanceController.autoAssign);

router.get('/:id', maintenanceController.getRequest);

module.exports = router;
