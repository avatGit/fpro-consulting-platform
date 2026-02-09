const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../validators/authValidators');
const { createReportSchema } = require('../validators/maintenanceValidators');

router.use(authenticate);
router.use(require('../middleware/rbacMiddleware').authorize('technicien', 'admin'));

router.get('/my', interventionController.listMyInterventions);
router.post('/:id/start', interventionController.startIntervention);
router.post('/:id/report', validate(createReportSchema), interventionController.createReport);
router.get('/:id/report', interventionController.getReport);

module.exports = router;
