import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../providers/quote_provider.dart';
import '../utils/constants.dart';

class DashboardOverview extends StatelessWidget {
  final Function(String)? onNavigate;
  const DashboardOverview({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return Consumer2<CartProvider, QuoteProvider>(
      builder: (context, cart, quoteProvider, child) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Cards Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                _buildStatCard(
                  title: 'Commande En Cours',
                  value: cart.orders.length.toString(),
                  color: AppColors.statusOrange,
                ),
                _buildStatCard(
                  title: 'Devis En Attente',
                  value: quoteProvider.quotes
                      .where((q) => q.status.name == 'pending')
                      .length
                      .toString(),
                  color: AppColors.statusBlue,
                ),
                _buildStatCard(
                  title: 'Articles Panier',
                  value: cart.cartItemCount.toString(),
                  color: AppColors.statusGreen,
                ),
                _buildStatCard(
                  title: 'Total Panier',
                  value: '${(cart.cartTotalPrice / 1000).toStringAsFixed(1)}k',
                  color: AppColors.statusYellow,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Recent Activities Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Activités Récentes',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryBlue,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () {},
                  color: AppColors.primaryBlue,
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Activity Items - Show a few recent orders/quotes
            ...cart.orders
                .take(2)
                .map(
                  (order) => _buildActivityItem(
                    type: 'Commande',
                    id: '#${order.id.substring(0, 4)}',
                    status: order.statusText,
                    statusColor: _getStatusColor(order.status.name),
                    onTap: () => onNavigate?.call('Commandes'),
                  ),
                ),

            ...quoteProvider.quotes
                .take(2)
                .map(
                  (quote) => _buildActivityItem(
                    type: 'Devis',
                    id: quote.reference,
                    status: quote.status.name,
                    statusColor: _getStatusColor(quote.status.name),
                    onTap: () => onNavigate?.call('Devis'),
                  ),
                ),

            if (cart.orders.isEmpty && quoteProvider.quotes.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Text(
                    'Aucune activité récente',
                    style: TextStyle(color: AppColors.textLight),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'enattente':
      case 'en attente':
        return AppColors.statusYellow;
      case 'accepted':
      case 'validé':
      case 'confirmé':
      case 'termine':
      case 'terminé':
        return AppColors.statusGreen;
      case 'shipped':
      case 'encours':
      case 'en cours':
        return AppColors.statusBlue;
      default:
        return AppColors.statusOrange;
    }
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: color, width: 4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textLight,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem({
    required String type,
    required String id,
    required String status,
    required Color statusColor,
    VoidCallback? onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border(left: BorderSide(color: statusColor, width: 4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  type,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textDark,
                  ),
                ),
              ),
              if (id.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    id,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: statusColor,
                  ),
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: onTap,
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(0, 0),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Row(
                  children: [
                    Text(
                      'Details',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.chevron_right, size: 16),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
