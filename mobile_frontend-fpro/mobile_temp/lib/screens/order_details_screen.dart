import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../features/auth/providers/auth_provider.dart';
import '../providers/agent_provider.dart';
import '../providers/cart_provider.dart';
import '../models/order.dart';
import '../utils/constants.dart';

class OrderDetailsScreen extends StatelessWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final agentProvider = context.watch<AgentProvider>();
    final cartProvider = context.watch<CartProvider>();

    // Tentative de trouver la commande dans l'un ou l'autre provider (dépend du rôle)
    Order order;
    try {
      order = agentProvider.orders.firstWhere((o) => o.id == orderId);
    } catch (_) {
      order = cartProvider.orders.firstWhere((o) => o.id == orderId);
    }

    final userRole = authProvider.user?.role ?? 'client';

    return Scaffold(
      appBar: AppBar(
        title: Text('Commande #${order.reference}'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusHeader(order),
            const SizedBox(height: 24),
            Text('Produits', style: AppTextStyles.heading2),
            const Divider(),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: order.items.length,
              itemBuilder: (context, index) {
                final item = order.items[index];
                return ListTile(
                  title: Text(item.name),
                  subtitle: Text('Quantité: ${item.quantity}'),
                  trailing: Text('${item.price * item.quantity} FCFA'),
                );
              },
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total', style: AppTextStyles.heading2),
                  Text(
                    '${order.totalPrice} FCFA',
                    style: AppTextStyles.heading2.copyWith(
                      color: AppColors.primaryBlue,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            if (order.status == OrderStatus.enAttente) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: agentProvider.isLoading
                      ? null
                      : () => _showConfirmDialog(context, true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(16),
                  ),
                  child: agentProvider.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('VALIDER LA COMMANDE'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: agentProvider.isLoading
                      ? null
                      : () => _showConfirmDialog(context, false),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    padding: const EdgeInsets.all(16),
                  ),
                  child: const Text('REFUSER LA COMMANDE'),
                ),
              ),
            ],
            // [Correction] Bouton confirmer réception affiché uniquement pour client
            if (Order.canClientComplete(order, userRole)) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: cartProvider.isLoading
                      ? null
                      : () => _confirmReceipt(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(16),
                  ),
                  child: cartProvider.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('CONFIRMER LA RÉCEPTION'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _confirmReceipt(BuildContext context) async {
    final cartProvider = context.read<CartProvider>();
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    try {
      await cartProvider.confirmReceipt(orderId);
      scaffoldMessenger.showSnackBar(
        const SnackBar(
          content: Text('Réception confirmée avec succès !'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Erreur : $e'), backgroundColor: Colors.red),
      );
    }
  }

  Widget _buildStatusHeader(Order order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.lightBlue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: AppColors.primaryBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Statut actuel',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(order.statusText),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showConfirmDialog(BuildContext context, bool isValidation) {
    final TextEditingController messageController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          isValidation ? 'Valider la commande' : 'Refuser la commande',
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isValidation
                  ? 'Voulez-vous valider cette commande ? Un message optionnel sera envoyé au client.'
                  : 'Veuillez saisir le motif du refus.',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: messageController,
              decoration: const InputDecoration(
                hintText: 'Message au client...',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ANNULER'),
          ),
          ElevatedButton(
            onPressed: () {
              final provider = context.read<AgentProvider>();
              if (isValidation) {
                provider.validateOrder(orderId).then((_) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Commande validée')),
                  );
                });
              } else {
                if (messageController.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Le motif est obligatoire pour un refus'),
                    ),
                  );
                  return;
                }
                provider.refuseOrder(orderId, messageController.text).then((_) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Commande refusée')),
                  );
                });
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: isValidation ? Colors.green : Colors.red,
              foregroundColor: Colors.white,
            ),
            child: Text(isValidation ? 'VALIDER' : 'REFUSER'),
          ),
        ],
      ),
    );
  }
}
