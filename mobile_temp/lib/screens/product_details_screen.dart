import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/agent_provider.dart';
import '../utils/constants.dart';

class ProductDetailsScreen extends StatelessWidget {
  final String productId;

  const ProductDetailsScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AgentProvider>();
    final product = provider.products.firstWhere(
      (p) => p.id == productId,
      orElse: () => provider.products.first,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(product.name),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 250,
              width: double.infinity,
              color: AppColors.lightBlue.withOpacity(0.1),
              child: const Icon(
                Icons.inventory,
                size: 80,
                color: AppColors.primaryBlue,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        product.category,
                        style: TextStyle(
                          color: AppColors.primaryBlue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${product.price} FCFA',
                        style: AppTextStyles.heading2.copyWith(
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(product.name, style: AppTextStyles.heading1),
                  const SizedBox(height: 8),
                  Text(
                    'Stock disponible: ${product.stock}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 24),
                  Text('Description', style: AppTextStyles.heading2),
                  const Divider(),
                  Text(product.description),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
