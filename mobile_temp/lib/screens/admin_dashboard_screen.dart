import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../providers/admin_provider.dart';
import '../models/product.dart';
import '../models/rental_item.dart';
import '../models/maintenance_request.dart';
import '../models/user_profile.dart';
import '../widgets/admin_product_dialog.dart';
import '../providers/cart_provider.dart';
import '../models/order.dart';
import 'home_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  String _activeSection = 'Overview';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6), // Light gray background
      appBar: AppBar(
        title: const Text(
          'Dashboard Admin',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppColors.primaryBlue,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
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
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primaryBlue, AppColors.lightBlue],
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset('assets/images/logo.png', height: 40),
                    const SizedBox(height: 10),
                    const Text(
                      'ESPACE ADMIN',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _buildDrawerItem('Overview', Icons.dashboard),
            _buildDrawerItem('Produits', Icons.shopping_cart),
            _buildDrawerItem('Locations', Icons.event),
            _buildDrawerItem('Commandes', Icons.shopping_bag),
            _buildDrawerItem('Maintenance', Icons.build),
            _buildDrawerItem('Staff', Icons.people),
            const Spacer(),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.visibility),
              title: const Text('Voir comme client'),
              onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const HomeScreen()),
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: _buildActiveSection(),
      ),
    );
  }

  Widget _buildDrawerItem(String title, IconData icon) {
    final isSelected = _activeSection == title;
    return ListTile(
      leading: Icon(icon, color: isSelected ? AppColors.primaryBlue : Colors.grey),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppColors.primaryBlue : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      onTap: () {
        setState(() {
          _activeSection = title;
        });
        Navigator.pop(context);
      },
    );
  }

  Widget _buildActiveSection() {
    switch (_activeSection) {
      case 'Overview':
        return _buildOverview();
      case 'Produits':
        return _buildProductList(isRental: false);
      case 'Locations':
        return _buildProductList(isRental: true);
      case 'Commandes':
        return _buildOrdersList();
      case 'Maintenance':
        return _buildMaintenanceList();
      case 'Staff':
        return _buildStaffList();
      default:
        return _buildOverview();
    }
  }

  Widget _buildProductList({required bool isRental}) {
    return Consumer<AdminProvider>(
      builder: (context, admin, child) {
        final items = isRental ? admin.rentalItems : admin.products;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isRental ? 'Gestion des Locations' : 'Catalogue Produits',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                ElevatedButton.icon(
                  onPressed: () => _showProductDialog(isRental: isRental),
                  icon: const Icon(Icons.add),
                  label: const Text('Ajouter'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final product = items[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.image, color: Colors.grey),
                    ),
                    title: Text(isRental ? (product as RentalItem).name : (product as Product).name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(isRental 
                      ? '${(product as RentalItem).pricePerDay.toStringAsFixed(0)} FCFA/j'
                      : '${(product as Product).price.toStringAsFixed(0)} FCFA | Stock: ${(product as Product).stock}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () => _showProductDialog(item: product, isRental: isRental),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _showDeleteConfirm(isRental ? (product as RentalItem).id : (product as Product).id, isRental),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildRecentActivityList() {
    return Column(
      children: [
        _buildActivityItem('Nouvelle commande CMD-1032', 'F-PRO Solutions - 12/11/2024'),
        _buildActivityItem('Nouvelle commande CMD-832', 'Tech Corp - 13/11/2024'),
      ],
    );
  }

  Widget _buildActivityItem(String title, String subtitle) {
    return ListTile(
      leading: const CircleAvatar(
        backgroundColor: AppColors.lightBlue,
        child: Icon(Icons.history, size: 18, color: AppColors.primaryBlue),
      ),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textLight)),
      contentPadding: EdgeInsets.zero,
    );
  }


  Widget _buildOrdersList() {
    return Consumer<CartProvider>(
      builder: (context, cart, child) {
        final orders = cart.orders;
        if (orders.isEmpty) {
          return const Center(
            child: Column(
              children: [
                SizedBox(height: 48),
                Icon(Icons.shopping_bag_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('Aucune commande enregistrée.'),
              ],
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Gestion des Commandes',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ExpansionTile(
                    title: Text('Ref: ${order.reference}'),
                    subtitle: Text('Client: Demo User | Total: ${order.totalPrice.toStringAsFixed(0)} FCFA'),
                    trailing: _buildStatusBadge(order.status),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Articles:', style: TextStyle(fontWeight: FontWeight.bold)),
                            ...order.items.map((item) => Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text('• ${item.name} x${item.quantity}'),
                            )),
                            const Divider(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                const Text('Changer statut: '),
                                const SizedBox(width: 8),
                                DropdownButton<OrderStatus>(
                                  value: order.status,
                                  items: OrderStatus.values.map((status) {
                                    String label = '';
                                    switch(status) {
                                      case OrderStatus.enAttente: label = 'En attente'; break;
                                      case OrderStatus.enCours: label = 'En cours'; break;
                                      case OrderStatus.termine: label = 'Terminé'; break;
                                    }
                                    return DropdownMenuItem(
                                      value: status,
                                      child: Text(label),
                                    );
                                  }).toList(),
                                  onChanged: (newStatus) {
                                    if (newStatus != null) {
                                      cart.updateOrderStatus(order.id, newStatus);
                                    }
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatusBadge(OrderStatus status) {
    Color color = Colors.grey;
    String label = '';
    switch(status) {
      case OrderStatus.enAttente: 
        color = Colors.orange; 
        label = 'En attente';
        break;
      case OrderStatus.enCours: 
        color = Colors.blue; 
        label = 'En cours';
        break;
      case OrderStatus.termine: 
        color = Colors.green; 
        label = 'Terminé';
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildMaintenanceList() {
    return Consumer<AdminProvider>(
      builder: (context, admin, child) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Suivi de Maintenance',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: admin.maintenanceRequests.length,
              itemBuilder: (context, index) {
                final req = admin.maintenanceRequests[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ExpansionTile(
                    title: Text('${req.equipmentType} - ${req.clientName}'),
                    subtitle: Text('Statut: ${req.statusLabel} | Urgence: ${req.urgency}'),
                    leading: Icon(
                      Icons.build,
                      color: req.urgency == 'Haute' ? Colors.red : Colors.orange,
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Description: ${req.description}'),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Text('Technicien: '),
                                Text(
                                  req.technicianName ?? 'Non assigné',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                TextButton(
                                  onPressed: () => _updateMaintenance(req),
                                  child: const Text('Mettre à jour'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }


  Widget _buildOverview() {
    return Consumer<AdminProvider>(
      builder: (context, admin, child) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Statistiques',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              childAspectRatio: 1.5,
              children: [
                _buildStatCard('Commandes', '${admin.pendingOrdersCount}', Colors.orange),
                _buildStatCard('En attente', '${admin.pendingMaintenanceCount}', Colors.blue),
                _buildStatCard('Maintenance', '${admin.activeMaintenanceCount}', Colors.red),
                _buildStatCard('Stock', '${admin.totalStockItems}', Colors.green),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              'Activités Récentes',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildRecentActivityList(),
          ],
        );
      },
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: color, width: 4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 14, color: AppColors.textLight),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  void _showProductDialog({dynamic item, required bool isRental}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AdminProductDialog(item: item, isRental: isRental),
    );
  }

  void _showDeleteConfirm(String id, bool isRental) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmer la suppression'),
        content: const Text('Voulez-vous vraiment supprimer cet article ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              if (isRental) {
                context.read<AdminProvider>().deleteRental(id);
              } else {
                context.read<AdminProvider>().deleteProduct(id);
              }
              Navigator.pop(context);
            },
            child: const Text('Supprimer', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffList() {
    return Consumer<AdminProvider>(
      builder: (context, admin, child) {
        final allStaff = [...admin.agents, ...admin.technicians];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Gestion du Personnel',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                ElevatedButton.icon(
                  onPressed: _showAddStaffDialog,
                  icon: const Icon(Icons.person_add),
                  label: const Text('Nouveau'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: allStaff.length,
              itemBuilder: (context, index) {
                final staff = allStaff[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: staff.role == 'agent' ? Colors.blue[100] : Colors.red[100],
                      child: Icon(
                        staff.role == 'agent' ? Icons.support_agent : Icons.engineering,
                        color: staff.role == 'agent' ? Colors.blue : Colors.red,
                      ),
                    ),
                    title: Text(staff.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('Rôle: ${staff.role.toUpperCase()} | Email: ${staff.email}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () => _showEditStaffDialog(staff),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Confirmer la suppression'),
                                content: Text('Voulez-vous vraiment supprimer ${staff.name} ?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context),
                                    child: const Text('Annuler'),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      if (staff.role == 'agent') {
                                        context.read<AdminProvider>().deleteAgent(staff.id);
                                      } else {
                                        context.read<AdminProvider>().deleteTechnician(staff.id);
                                      }
                                      Navigator.pop(context);
                                    },
                                    child: const Text('Supprimer', style: TextStyle(color: Colors.red)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  void _showEditStaffDialog(dynamic staff) {
    final nameController = TextEditingController(text: staff.name);
    final phoneController = TextEditingController(text: staff.phone);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Modifier ${staff.role}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Nom complet'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneController,
              decoration: const InputDecoration(labelText: 'Téléphone'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              final updatedUser = (staff as UserProfile).copyWith(
                name: nameController.text,
                phone: phoneController.text,
              );
              if (staff.role == 'agent') {
                context.read<AdminProvider>().updateAgent(updatedUser);
              } else {
                context.read<AdminProvider>().updateTechnician(updatedUser);
              }
              Navigator.pop(context);
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  void _updateMaintenance(MaintenanceRequest request) {
    String? selectedTech = request.technicianName;
    MaintenanceStatus selectedStatus = request.status;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Mise à jour Maintenance'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<MaintenanceStatus>(
                value: selectedStatus,
                decoration: const InputDecoration(labelText: 'Statut'),
                items: MaintenanceStatus.values.map((s) {
                  String label = '';
                  switch(s) {
                    case MaintenanceStatus.enAttente: label = 'En attente'; break;
                    case MaintenanceStatus.enCours: label = 'En cours'; break;
                    case MaintenanceStatus.termine: label = 'Terminé'; break;
                    case MaintenanceStatus.annule: label = 'Annulé'; break;
                  }
                  return DropdownMenuItem(value: s, child: Text(label));
                }).toList(),
                onChanged: (v) => setDialogState(() => selectedStatus = v!),
              ),
              const SizedBox(height: 16),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Technicien assigné',
                  hintText: 'Nom du technicien',
                ),
                controller: TextEditingController(text: selectedTech),
                onChanged: (v) => selectedTech = v,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () {
                context.read<AdminProvider>().updateMaintenanceStatus(
                  request.id,
                  selectedStatus,
                  technicianName: selectedTech,
                );
                Navigator.pop(context);
              },
              child: const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddStaffDialog() {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
    String selectedRole = 'agent';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Ajouter un Personnel'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedRole,
                  decoration: const InputDecoration(labelText: 'Rôle'),
                  items: const [
                    DropdownMenuItem(value: 'agent', child: Text('Agent')),
                    DropdownMenuItem(value: 'technician', child: Text('Technicien')),
                  ],
                  onChanged: (v) => setDialogState(() => selectedRole = v!),
                ),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Nom complet'),
                ),
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                TextField(
                  controller: phoneController,
                  decoration: const InputDecoration(labelText: 'Téléphone'),
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
                final id = '${selectedRole[0]}${DateTime.now().millisecondsSinceEpoch}';
                final newUser = UserProfile(
                  id: id,
                  name: nameController.text,
                  role: selectedRole,
                  email: emailController.text,
                  company: 'F-PRO',
                  phone: phoneController.text,
                  memberSince: DateTime.now(),
                );

                if (selectedRole == 'agent') {
                  context.read<AdminProvider>().addAgent(newUser);
                } else {
                  context.read<AdminProvider>().addTechnician(newUser);
                }
                Navigator.pop(context);
              },
              child: const Text('Ajouter'),
            ),
          ],
        ),
      ),
    );
  }
}

