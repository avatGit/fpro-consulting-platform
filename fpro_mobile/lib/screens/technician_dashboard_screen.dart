import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/admin_provider.dart';
import '../utils/constants.dart';
import '../models/maintenance_request.dart';
import 'home_screen.dart';

class TechnicianDashboardScreen extends StatefulWidget {
  const TechnicianDashboardScreen({super.key});

  @override
  State<TechnicianDashboardScreen> createState() => _TechnicianDashboardScreenState();
}

class _TechnicianDashboardScreenState extends State<TechnicianDashboardScreen> {
  final _reportController = TextEditingController();

  @override
  void dispose() {
    _reportController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final allRequests = context.watch<AdminProvider>().maintenanceRequests;
    final pendingRequests = allRequests.where((r) => r.status == MaintenanceStatus.enAttente).toList();
    final inProgressRequests = allRequests.where((r) => r.status == MaintenanceStatus.enCours).toList();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Espace Technicien'),
          backgroundColor: AppColors.primaryBlue,
          foregroundColor: Colors.white,
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.new_releases), text: 'Réception'),
              Tab(icon: Icon(Icons.assignment), text: 'Mes Tâches'),
            ],
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: Colors.white,
          ),
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
        body: TabBarView(
          children: [
            _buildRequestList(pendingRequests, isPending: true),
            _buildRequestList(inProgressRequests, isPending: false),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestList(List<MaintenanceRequest> requests, {required bool isPending}) {
    if (requests.isEmpty) {
      return Center(
        child: Text(
          isPending ? 'Aucune nouvelle demande.' : 'Aucune tâche en cours.',
          style: const TextStyle(color: Colors.grey),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: requests.length,
      itemBuilder: (context, index) {
        final request = requests[index];
        return Card(
          elevation: 4,
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(request.equipmentType, style: AppTextStyles.heading3),
                    Chip(
                      label: Text(request.status.name),
                      backgroundColor: isPending ? Colors.orange[100] : Colors.blue[100],
                    ),
                  ],
                ),
                const Divider(),
                Text('Client: ${request.clientName}'),
                const SizedBox(height: 8),
                Text('Description: ${request.description}'),
                const SizedBox(height: 16),
                isPending
                    ? ElevatedButton.icon(
                        onPressed: () {
                          context.read<AdminProvider>().updateMaintenanceStatus(
                                request.id,
                                MaintenanceStatus.enCours,
                                technicianName: 'Mon Nom', // Mock
                              );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Demande acceptée')),
                          );
                        },
                        icon: const Icon(Icons.check_circle),
                        label: const Text('Accepter la mission'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                      )
                    : ElevatedButton.icon(
                        onPressed: () {
                          _showReportDialog(context, request);
                        },
                        icon: const Icon(Icons.edit_note),
                        label: const Text('Terminer & Rapport'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryBlue,
                          foregroundColor: Colors.white,
                        ),
                      ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showReportDialog(BuildContext context, MaintenanceRequest request) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Rapport pour ${request.equipmentType}'),
        content: TextField(
          controller: _reportController,
          maxLines: 5,
          decoration: const InputDecoration(
            hintText: 'Décrivez les actions effectuées...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              // Mark maintenance as completed
              context.read<AdminProvider>().updateMaintenanceStatus(
                request.id, 
                MaintenanceStatus.termine,
              );
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Rapport envoyé et maintenance terminée')),
              );
              Navigator.pop(context);
              _reportController.clear();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );
  }
}
