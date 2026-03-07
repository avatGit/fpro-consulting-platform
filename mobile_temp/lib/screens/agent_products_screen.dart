import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/agent_provider.dart';
import '../models/product.dart';
import '../utils/constants.dart';
import '../widgets/product_form_dialog.dart';
import '../services/agent_service.dart';

class AgentProductsScreen extends StatefulWidget {
  const AgentProductsScreen({super.key});

  @override
  State<AgentProductsScreen> createState() => _AgentProductsScreenState();
}

class _AgentProductsScreenState extends State<AgentProductsScreen> {
  late AgentProvider _agentProvider;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AgentProvider>().fetchAllData(); // Fetches all for list
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catalogue Produits'),
        automaticallyImplyLeading: false,
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showProductDialog(context),
          ),
        ],
      ),
      body: Consumer<AgentProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.products.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final products = provider.products;

          if (products.isEmpty) {
            return const Center(child: Text('Aucun produit trouvé.'));
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchAllData(),
            child: ListView.builder(
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.lightBlue.withOpacity(0.1),
                      child: const Icon(
                        Icons.inventory,
                        color: AppColors.primaryBlue,
                      ),
                    ),
                    title: Text(product.name),
                    subtitle: Text(
                      '${product.price} FCFA • Stock: ${product.stock}',
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () =>
                              _showProductDialog(context, product: product),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () =>
                              _showDeleteConfirmation(context, product),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showProductDialog(BuildContext context, {Product? product}) {
    showDialog(
      context: context,
      builder: (context) => ProductFormDialog(product: product),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Product product) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmer la suppression'),
        content: Text('Voulez-vous vraiment supprimer "${product.name}" ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ANNULER'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context); // Ferme le dialogue
              try {
                //await _agentProvider.deleteProduct(product.id);
                await context.read<AgentProvider>().deleteProduct(product.id);

                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${product.name} supprimé avec succès'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Erreur: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('SUPPRIMER'),
          ),
        ],
      ),
    );
  }
}
