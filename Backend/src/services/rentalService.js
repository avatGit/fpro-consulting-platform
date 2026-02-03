const rentalRepository = require('../repositories/rentalRepository');
const productRepository = require('../repositories/productRepository');
const { sequelize, RentalItem } = require('../models');

class RentalService {
    async createBooking(userId, companyId, items) {
        const transaction = await sequelize.transaction();
        try {
            let totalAmount = 0;
            const rental = await rentalRepository.create({
                user_id: userId,
                company_id: companyId,
                status: 'pending'
            }, { transaction });

            for (const item of items) {
                const isAvailable = await rentalRepository.checkAvailability(
                    item.productId,
                    new Date(item.startDate),
                    new Date(item.endDate)
                );

                if (!isAvailable) {
                    throw new Error(`Le produit ${item.productId} n'est pas disponible pour ces dates`);
                }

                const product = await productRepository.findById(item.productId);
                const days = Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24));
                const subtotal = days * parseFloat(product.base_price) * item.quantity;
                totalAmount += subtotal;

                await RentalItem.create({
                    rental_id: rental.id,
                    product_id: item.productId,
                    start_date: item.startDate,
                    end_date: item.endDate,
                    quantity: item.quantity,
                    unit_price_per_day: product.base_price,
                    subtotal
                }, { transaction });
            }

            await rental.update({ total_price: totalAmount }, { transaction });
            await transaction.commit();
            return await rentalRepository.findWithDetails(rental.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async checkAvailability(productId, startDate, endDate) {
        return await rentalRepository.checkAvailability(productId, new Date(startDate), new Date(endDate));
    }

    async confirmBooking(rentalId) {
        const rental = await rentalRepository.findById(rentalId);
        if (!rental) throw new Error('Réservation non trouvée');
        return await rental.update({ status: 'confirmed' });
    }
}

module.exports = new RentalService();
