const technicianRepository = require('../repositories/technicianRepository');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class TechnicianController {
    /**
     * Create a standalone technician
     * POST /api/technicians
     */
    async createTechnician(req, res) {
        try {
            const { name, phone, email, skills } = req.body;

            if (!name) {
                return ResponseHandler.error(res, 'Le nom est requis', 422);
            }

            const technician = await technicianRepository.create({
                name,
                phone,
                email: email && email.trim() ? email.trim() : null,
                skills: skills || [],
                is_available: true,
                workload: 0
            });

            logger.info(`Standalone technician created: ${name}`);
            return ResponseHandler.created(res, technician, 'Technicien créé avec succès');
        } catch (error) {
            logger.error('Create technician error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * List all technicians (Admin/Agent overview)
     * GET /api/technicians
     */
    async listTechnicians(req, res) {
        try {
            const technicians = await technicianRepository.findAll({
                include: [{ association: 'user', attributes: ['first_name', 'last_name', 'email'] }]
            });
            return ResponseHandler.success(res, technicians, 'Liste des techniciens récupérée');
        } catch (error) {
            logger.error('List technicians error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }

    /**
     * Delete a technician record
     * DELETE /api/technicians/:id
     */
    async deleteTechnician(req, res) {
        try {
            const { id } = req.params;
            const technician = await technicianRepository.findById(id);

            if (!technician) {
                return ResponseHandler.notFound(res, 'Technicien non trouvé');
            }

            await technician.destroy();
            logger.info(`Technician deleted: ${id}`);
            return ResponseHandler.success(res, null, 'Technicien supprimé avec succès');
        } catch (error) {
            logger.error('Delete technician error:', error);
            return ResponseHandler.serverError(res, error);
        }
    }
}

module.exports = new TechnicianController();
