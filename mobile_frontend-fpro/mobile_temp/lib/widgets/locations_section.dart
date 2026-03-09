import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../providers/cart_provider.dart';
import '../providers/admin_provider.dart';
import '../models/cart_item.dart';
import '../models/rental_item.dart';

class LocationsSection extends StatelessWidget {
  const LocationsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Location d\'Équipements',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryBlue,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Réservez du matériel professionnel pour vos besoins ponctuels.',
          style: TextStyle(fontSize: 14, color: AppColors.textLight),
        ),
        const SizedBox(height: 24),

        // Search and Filter Bar
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.mediumGray),
                ),
                child: const TextField(
                  decoration: InputDecoration(
                    hintText: 'Rechercher un matériel...',
                    border: InputBorder.none,
                    icon: Icon(Icons.search, size: 20),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.filter_list,
                color: Colors.white,
                size: 20,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Featured Equipment List
        Consumer<AdminProvider>(
          builder: (context, admin, child) {
            if (admin.rentalItems.isEmpty) {
              return const Center(child: Text('Aucun équipement disponible.'));
            }
            return ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: admin.rentalItems.length,
              itemBuilder: (context, index) {
                final rental = admin.rentalItems[index];
                return _buildLocationCard(context, rental);
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildLocationCard(BuildContext context, RentalItem rental) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.lightGray,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.devices,
              size: 30,
              color: AppColors.mediumGray,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      rental.available ? 'Disponible' : 'Indisponible',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: rental.available ? Colors.green : Colors.red,
                      ),
                    ),
                    Text(
                      '${rental.pricePerDay.toStringAsFixed(0)} FCFA / jour',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryBlue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  rental.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  rental.description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textLight,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: rental.available
                        ? () => _showRentalDialog(context, rental)
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryBlue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Réserver',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showRentalDialog(BuildContext context, RentalItem rental) {
    RentalDuration selectedDuration = RentalDuration.oneDay;
    DateTime startDate = DateTime.now();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          final endDate = startDate.add(Duration(days: selectedDuration.days));
          final totalPrice = rental.calculatePrice(selectedDuration.days);

          return AlertDialog(
            title: const Text('Réserver un équipement'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    rental.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${rental.pricePerDay.toStringAsFixed(0)} FCFA / jour',
                    style: const TextStyle(
                      color: AppColors.primaryBlue,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Durée de location',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  ...RentalDuration.values.map((duration) {
                    return RadioListTile<RentalDuration>(
                      title: Text(duration.label),
                      subtitle: Text(
                        '${rental.calculatePrice(duration.days).toStringAsFixed(0)} FCFA',
                        style: const TextStyle(
                          color: AppColors.primaryBlue,
                          fontSize: 12,
                        ),
                      ),
                      value: duration,
                      groupValue: selectedDuration,
                      onChanged: (value) {
                        setDialogState(() {
                          selectedDuration = value!;
                        });
                      },
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                    );
                  }),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.lightGray,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Début:',
                              style: TextStyle(fontSize: 12),
                            ),
                            Text(
                              '${startDate.day}/${startDate.month}/${startDate.year}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Fin:', style: TextStyle(fontSize: 12)),
                            Text(
                              '${endDate.day}/${endDate.month}/${endDate.year}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Total:',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            Text(
                              '${totalPrice.toStringAsFixed(0)} FCFA',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: AppColors.primaryBlue,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Annuler'),
              ),
              ElevatedButton(
                onPressed: () {
                  final cartItem = CartItem(
                    id: rental.id,
                    name: rental.name,
                    category: 'Location',
                    price: rental.pricePerDay,
                    imageUrl: rental.imageUrl,
                    quantity: 1,
                    type: ProductType.rental,
                    rentalDurationDays: selectedDuration.days,
                    rentalStartDate: startDate,
                    rentalEndDate: endDate,
                  );

                  Provider.of<CartProvider>(
                    context,
                    listen: false,
                  ).addToCart(cartItem);

                  Navigator.pop(context);

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        '${rental.name} ajouté au panier (${selectedDuration.label})',
                      ),
                      duration: const Duration(seconds: 2),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryBlue,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Ajouter au panier'),
              ),
            ],
          );
        },
      ),
    );
  }
}
