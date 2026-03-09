import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/technicien_provider.dart';
import '../models/maintenance_request.dart';
import '../models/intervention_model.dart';
import '../utils/constants.dart';
import 'home_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import 'technician_profile_screen.dart';
import 'technicien_request_details_screen.dart';
import '../models/review.dart';

// [Changement] Import de TechnicienRequestDetailsScreen pour permettre la navigation vers la vue détaillée.

// [Changement] Refactorisation complète de TechnicienDashboardScreen pour utiliser TechnicienProvider.
// Auparavant, l'écran utilisait AdminProvider avec des données simulées. Il consomme maintenant les données réelles
// de l'endpoint /api/interventions/my.
class TechnicienDashboardScreen extends StatefulWidget {
  const TechnicienDashboardScreen({super.key});

  @override
  State<TechnicienDashboardScreen> createState() =>
      _TechnicienDashboardScreenState();
}

class _TechnicienDashboardScreenState extends State<TechnicienDashboardScreen> {
  final _reportController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // [Changement] Déclenchement de la récupération initiale des interventions assignées au technicien.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TechnicienProvider>().fetchInterventions();
      context.read<TechnicienProvider>().fetchReviews();
    });
  }

  @override
  void dispose() {
    _reportController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TechnicienProvider>(
      builder: (context, provider, child) {
        final scheduled = provider.scheduledInterventions;
        final inProgress = provider.activeInterventions;

        return DefaultTabController(
          length: 3,
          child: Scaffold(
            appBar: AppBar(
              title: const Text('Espace Technicien'),
              automaticallyImplyLeading: false,
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              bottom: const TabBar(
                tabs: [
                  Tab(icon: Icon(Icons.new_releases), text: 'À Faire'),
                  Tab(icon: Icon(Icons.assignment), text: 'En Cours'),
                  Tab(icon: Icon(Icons.star), text: 'Avis'),
                ],
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white70,
                indicatorColor: Colors.white,
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () => provider.fetchInterventions(),
                ),
                PopupMenuButton(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.white,
                      child: Text(
                        provider.profile?.initials ?? 'T',
                        style: const TextStyle(
                          color: AppColors.primaryBlue,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'profile',
                      child: Row(
                        children: [
                          Icon(Icons.person, size: 18),
                          SizedBox(width: 10),
                          Text('Profil'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'logout',
                      child: Row(
                        children: [
                          Icon(Icons.logout, size: 18),
                          SizedBox(width: 10),
                          Text('Déconnexion'),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) async {
                    if (value == 'profile') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const TechnicianProfileScreen(),
                        ),
                      );
                    } else if (value == 'logout') {
                      await context.read<AuthProvider>().logout();
                      if (mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const HomeScreen(),
                          ),
                        );
                      }
                    }
                  },
                ),
              ],
            ),
            body: provider.error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline,
                            size: 48,
                            color: Colors.red,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            provider.error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.red),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: () => provider.fetchInterventions(),
                            child: const Text('Ressayer'),
                          ),
                        ],
                      ),
                    ),
                  )
                : provider.isLoading && provider.interventions.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : TabBarView(
                    children: [
                      _buildInterventionList(scheduled, isScheduled: true),
                      _buildInterventionList(inProgress, isScheduled: false),
                      _buildReviewsTab(provider.reviews),
                    ],
                  ),
          ),
        );
      },
    );
  }

  Widget _buildInterventionList(
    List<Intervention> interventions, {
    required bool isScheduled,
  }) {
    if (interventions.isEmpty) {
      return Center(
        child: Text(
          isScheduled ? 'Aucune nouvelle mission.' : 'Aucune mission en cours.',
          style: const TextStyle(color: Colors.grey),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: interventions.length,
      itemBuilder: (context, index) {
        final intervention = interventions[index];
        final request = intervention.request;

        return InkWell(
          onTap: () {
            // [Changement] Intégration de la navigation vers l'écran de détails.
            // Cela permet au technicien d'accéder aux informations complètes de la mission.
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    TechnicienRequestDetailsScreen(intervention: intervention),
              ),
            );
          },
          child: Card(
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
                      Text(
                        request?.equipmentType ?? 'Type inconnu',
                        style: AppTextStyles.heading3,
                      ),
                      Chip(
                        label: Text(intervention.statusDisplay),
                        backgroundColor: isScheduled
                            ? Colors.orange[100]
                            : Colors.blue[100],
                      ),
                    ],
                  ),
                  const Divider(),
                  Text('Client: ${request?.clientName ?? 'N/A'}'),
                  const SizedBox(height: 8),
                  Text(
                    'Description: ${request?.description ?? 'Pas de description'}',
                  ),
                  const SizedBox(height: 8),
                  Text('Priorité: ${request?.urgency ?? 'N/A'}'),
                  if (request?.status != MaintenanceStatus.closed) ...[
                    const SizedBox(height: 16),
                    isScheduled
                        ? ElevatedButton.icon(
                            onPressed: () async {
                              await context
                                  .read<TechnicienProvider>()
                                  .startIntervention(intervention.id);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Intervention démarrée'),
                                  ),
                                );
                              }
                            },
                            icon: const Icon(Icons.play_arrow),
                            label: const Text('Commencer la mission'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                          )
                        : ElevatedButton.icon(
                            onPressed: () {
                              _showReportDialog(context, intervention);
                            },
                            icon: const Icon(Icons.edit_note),
                            label: const Text('Terminer & Rapport'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryBlue,
                              foregroundColor: Colors.white,
                            ),
                          ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showReportDialog(BuildContext context, Intervention intervention) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Rapport d\'intervention'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Notez vos observations et les pièces utilisées.'),
            const SizedBox(height: 16),
            TextField(
              controller: _reportController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Description des travaux...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_reportController.text.isEmpty) return;

              // [Changement] Appel au provider pour soumettre le rapport d'intervention.
              // Le backend mettra automatiquement à jour le statut de l'intervention en 'completed'
              // et la demande de maintenance en 'completed_by_technician'.
              final success = await context
                  .read<TechnicienProvider>()
                  .submitReport(intervention.id, {
                    'notes': _reportController.text,
                    'time_spent_minutes': 60, // Mock for now
                    'parts_used': [], // Mock for now
                  });

              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Rapport envoyé avec succès')),
                );
                Navigator.pop(context);
                _reportController.clear();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Soumettre'),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsTab(List<Review> reviews) {
    if (reviews.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.star_outline, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Aucun avis client reçu pour le moment.',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: reviews.length,
      itemBuilder: (context, index) {
        final review = reviews[index];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Client: ${review.clientName ?? 'N/A'}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Row(
                      children: List.generate(5, (starIndex) {
                        return Icon(
                          starIndex < review.rating
                              ? Icons.star
                              : Icons.star_border,
                          color: Colors.amber,
                          size: 16,
                        );
                      }),
                    ),
                  ],
                ),
                const Divider(),
                if (review.comment != null && review.comment!.isNotEmpty)
                  Text(
                    review.comment!,
                    style: const TextStyle(fontStyle: FontStyle.italic),
                  ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    'Le ${review.createdAt?.toString().substring(0, 10) ?? ''}',
                    style: TextStyle(color: Colors.grey[500], fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
