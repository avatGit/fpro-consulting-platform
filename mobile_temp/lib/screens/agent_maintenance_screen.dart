import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/agent_provider.dart';
import '../utils/constants.dart';
import 'maintenance_details_screen.dart';

class AgentMaintenanceScreen extends StatefulWidget {
  const AgentMaintenanceScreen({super.key});

  @override
  State<AgentMaintenanceScreen> createState() => _AgentMaintenanceScreenState();
}

class _AgentMaintenanceScreenState extends State<AgentMaintenanceScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AgentProvider>().fetchMaintenance();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Maintenance & Interventions'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: Consumer<AgentProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.maintenanceRequests.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final requests = provider.maintenanceRequests;

          if (requests.isEmpty) {
            return const Center(child: Text('Aucune demande de maintenance.'));
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchMaintenance(),
            child: ListView.builder(
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final request = requests[index];
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getUrgencyColor(
                        request.urgency,
                      ).withOpacity(0.1),
                      child: Icon(
                        Icons.build,
                        color: _getUrgencyColor(request.urgency),
                      ),
                    ),
                    title: Text(request.equipmentType),
                    subtitle: Text(
                      'Client: ${request.clientName} • ${request.statusLabel}',
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              MaintenanceDetailsScreen(requestId: request.id),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  Color _getUrgencyColor(String urgency) {
    switch (urgency.toLowerCase()) {
      case 'urgent':
      case 'high':
      case 'haute':
        return Colors.red;
      case 'medium':
      case 'moyenne':
        return Colors.orange;
      case 'low':
      case 'faible':
        return Colors.green;
      default:
        return Colors.blue;
    }
  }
}
