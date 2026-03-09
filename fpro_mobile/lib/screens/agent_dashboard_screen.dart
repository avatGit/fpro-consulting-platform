import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';
import '../utils/constants.dart';
import '../models/maintenance_request.dart';
import '../models/order.dart';
import '../providers/cart_provider.dart';
import '../widgets/admin_product_dialog.dart';
import 'home_screen.dart';

class AgentDashboardScreen extends StatefulWidget {
  const AgentDashboardScreen({super.key});

  @override
  State<AgentDashboardScreen> createState() => _AgentDashboardScreenState();
}

class _AgentDashboardScreenState extends State<AgentDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Espace Agent'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AdminProvider>().logout();
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const HomeScreen()),
              );
            },
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        selectedItemColor: AppColors.primaryBlue,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Achats',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'Produits',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.build),
            label: 'Maintenance',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildPurchaseValidation();
      case 1:
        return _buildProductManagement();
      case 2:
        return _buildMaintenanceRequests();
      default:
        return const Center(child: Text('Sélectionnez une option'));
    }
  }

  Widget _buildPurchaseValidation() {
    final orders = context.watch<CartProvider>().orders.where((o) => o.status == OrderStatus.enAttente).toList();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text('Validation des Achats', style: AppTextStyles.heading2),
        ),
        orders.isEmpty 
          ? const Expanded(child: Center(child: Text('Aucune commande en attente.')))
          : Expanded(
              child: ListView.builder(
                itemCount: orders.length,
                itemBuilder: (context, index) {
                  final order = orders[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: ListTile(
                      title: Text('Commande #${order.reference}'),
                      subtitle: Text('Total: ${order.totalPrice} FCFA'),
                      trailing: ElevatedButton(
                        onPressed: () {
                          context.read<CartProvider>().updateOrderStatus(order.id, OrderStatus.enCours);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Commande validée')),
                          );
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                        child: const Text('Valider'),
                      ),
                    ),
                  );
                },
              ),
            ),
      ],
    );
  }

  Widget _buildProductManagement() {
    final products = context.watch<AdminProvider>().products;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Gestion des Produits', 
                  style: AppTextStyles.heading2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    builder: (context) => const AdminProductDialog(isRental: false),
                  );
                },
                icon: const Icon(Icons.add),
                label: const Text('Ajouter'),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryBlue, foregroundColor: Colors.white),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: CircleAvatar(backgroundColor: AppColors.lightBlue, child: const Icon(Icons.inventory, color: Colors.white)),
                  title: Text(product.name),
                  subtitle: Text('${product.price} FCFA - Stock: ${product.stock}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.edit, color: Colors.blue),
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        builder: (context) => AdminProductDialog(item: product, isRental: false),
                      );
                    },
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMaintenanceRequests() {
    final requests = context.watch<AdminProvider>().maintenanceRequests;
    final technicians = context.watch<AdminProvider>().technicians;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text('Demandes de Maintenance', style: AppTextStyles.heading2),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: requests.length,
            itemBuilder: (context, index) {
              final request = requests[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(request.equipmentType),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Client: ${request.clientName}'),
                      Text('Status: ${request.status.name}'),
                      if (request.technicianName != null) Text('Assigné à: ${request.technicianName}'),
                    ],
                  ),
                  trailing: request.technicianName == null 
                    ? DropdownButton<String>(
                        hint: const Text('Assigner'),
                        onChanged: (value) {
                          if (value != null) {
                            context.read<AdminProvider>().updateMaintenanceStatus(
                              request.id, 
                              MaintenanceStatus.enCours,
                              technicianName: value
                            );
                          }
                        },
                        items: technicians.map((tech) {
                          return DropdownMenuItem(
                            value: tech.name,
                            child: Text(tech.name),
                          );
                        }).toList(),
                      )
                    : const Icon(Icons.check_circle, color: Colors.green),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
