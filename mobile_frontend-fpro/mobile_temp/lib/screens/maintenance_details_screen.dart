import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../features/auth/providers/auth_provider.dart';
import '../providers/agent_provider.dart';
import '../providers/maintenance_provider.dart';
import '../models/maintenance_request.dart';
import '../utils/constants.dart';
import '../widgets/technicien_suggestion_widget.dart';
import '../widgets/review_form_widget.dart';

class MaintenanceDetailsScreen extends StatelessWidget {
  final String requestId;

  const MaintenanceDetailsScreen({super.key, required this.requestId});

  @override
  Widget build(BuildContext context) {
    // [Changement] Utilisation de MaintenanceProvider pour une synchronisation optimale
    final maintenanceProvider = context.watch<MaintenanceProvider>();
    final agentProvider = context.watch<AgentProvider>();
    // [Changement] Injection de AuthProvider pour vérifier le rôle de l'utilisateur
    final authProvider = context.watch<AuthProvider>();
    final userRole = authProvider.user?.role;

    // Support both providers for finding the request
    MaintenanceRequest? request;
    try {
      request = maintenanceProvider.requests.firstWhere(
        (r) => r.id == requestId,
      );
    } catch (_) {
      try {
        request = agentProvider.maintenanceRequests.firstWhere(
          (r) => r.id == requestId,
        );
      } catch (_) {
        return const Scaffold(body: Center(child: Text('Demande non trouvée')));
      }
    }

    final MaintenanceRequest req = request;
    final bool isClosed = req.status == MaintenanceStatus.closed;

    // [Changement] Correction affichage bouton confirmation maintenance client
    // Analyse obligatoire : Valeurs réelles
    print("ROLE: ${authProvider.user?.role}");
    print("STATUS RAW: ${req.status}");
    print("MAINTENANCE OBJECT: $req");
    print("DEBUG: Status Label: ${req.statusLabel}");

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails Maintenance'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: () => maintenanceProvider.refreshRequest(requestId),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildInfoCard(req),
              const SizedBox(height: 24),

              if (isClosed && userRole?.trim().toLowerCase() == 'client') ...[
                ReviewFormWidget(request: req),
                const SizedBox(height: 24),
              ],

              // [Changement] Masquer l'assignation si clôturé ou si l'utilisateur n'est pas agent/admin
              if (!isClosed &&
                  (userRole?.trim().toLowerCase() == 'agent' ||
                      userRole?.trim().toLowerCase() == 'admin')) ...[
                Text('Assignation Technicien', style: AppTextStyles.heading2),
                const Divider(),
                if (req.technicienName != null)
                  ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.person)),
                    title: Text(req.technicienName!),
                    subtitle: const Text('Technicien assigné'),
                    trailing: const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                    ),
                  )
                else
                  TechnicienSuggestionWidget(requestId: requestId),
              ] else if (req.technicienName != null) ...[
                Text('Intervenant', style: AppTextStyles.heading2),
                const Divider(),
                ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.person)),
                  title: Text(req.technicienName!),
                  subtitle: Text(
                    isClosed
                        ? 'A réalisé l\'intervention'
                        : 'En charge de l\'intervention',
                  ),
                ),
              ],

              const SizedBox(height: 24),
              // [Changement] Correction affichage bouton confirmation maintenance client
              // Le bouton n'apparaît que si le rôle est 'client' et le statut 'completed_by_technician'
              if (userRole?.trim().toLowerCase() == 'client' &&
                  req.status == MaintenanceStatus.completedByTechnician)
                _buildConfirmationAction(
                  context,
                  maintenanceProvider,
                  requestId,
                ),

              const SizedBox(height: 24),
              Text('Historique / Notes', style: AppTextStyles.heading2),
              const Divider(),
              // [Changement] Construction dynamique de l'historique
              _buildDynamicHistory(request),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConfirmationAction(
    BuildContext context,
    MaintenanceProvider provider,
    String id,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green),
      ),
      child: Column(
        children: [
          const Text(
            'Le technicien a terminé son intervention.',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: provider.isLoading
                ? null
                : () => provider.confirmMaintenance(id),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Confirmer la fin des travaux'),
          ),
        ],
      ),
    );
  }

  Widget _buildDynamicHistory(MaintenanceRequest request) {
    final List<Map<String, dynamic>> history = [];

    // Step 1: Creation
    history.add({
      'title': 'Demande créée',
      'subtitle': 'Statut: En attente',
      'date': request.date,
      'icon': Icons.add_circle_outline,
      'done': true,
    });

    // Step 2: Assignation
    if (request.status != MaintenanceStatus.pending) {
      history.add({
        'title': 'Technicien assigné',
        'subtitle': 'Assigné à: ${request.technicienName}',
        'date': null, // Date not currently in model for this step
        'icon': Icons.person_pin,
        'done': true,
      });
    }

    // Step 3: En cours
    if (request.status == MaintenanceStatus.inProgress ||
        request.status == MaintenanceStatus.completedByTechnician ||
        request.status == MaintenanceStatus.closed) {
      history.add({
        'title': 'Mission acceptée',
        'subtitle': 'Intervention en cours',
        'date': null,
        'icon': Icons.play_circle_outline,
        'done': true,
      });
    }

    // Step 4: Rapport
    if (request.status == MaintenanceStatus.completedByTechnician ||
        request.status == MaintenanceStatus.closed) {
      history.add({
        'title': 'Mission terminée',
        'subtitle': 'Rapport soumis par le technicien',
        'date': null,
        'icon': Icons.assignment_turned_in,
        'done': true,
      });
    }

    // Step 5: Clôture
    if (request.status == MaintenanceStatus.closed) {
      history.add({
        'title': 'Maintenance confirmée par le client',
        'subtitle': 'Clôturé avec succès',
        'date': null,
        'icon': Icons.verified,
        'done': true,
      });
    }

    return Column(
      children: history
          .map(
            (item) => ListTile(
              leading: Icon(item['icon'] as IconData, color: Colors.blue),
              title: Text(
                item['title'] as String,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(item['subtitle'] as String),
              trailing: item['date'] != null
                  ? Text(
                      item['date'].toString().substring(0, 10),
                      style: const TextStyle(fontSize: 12),
                    )
                  : null,
            ),
          )
          .toList(),
    );
  }

  Widget _buildInfoCard(MaintenanceRequest request) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(request.equipmentType, style: AppTextStyles.heading2),
                _buildPriorityBadge(request.urgency),
              ],
            ),
            const SizedBox(height: 8),
            Text('Client: ${request.clientName}'),
            Text('Date: ${request.date.toString().substring(0, 16)}'),
            const SizedBox(height: 12),
            const Text(
              'Description:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(request.description),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(String urgency) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: _getUrgencyColor(urgency).withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _getUrgencyColor(urgency)),
      ),
      child: Text(
        urgency.toUpperCase(),
        style: TextStyle(
          color: _getUrgencyColor(urgency),
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
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
      default:
        return Colors.green;
    }
  }
}
