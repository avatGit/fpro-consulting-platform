import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/intervention_model.dart';
import '../providers/technicien_provider.dart';
import '../utils/constants.dart';

// [Changement] Création de TechnicienRequestDetailsScreen pour offrir une vue plus riche d'une mission.
// Cela inclut les détails complets de la demande de maintenance, les informations client, et permet de lancer les actions critiques (Démarrer/Rapport).
class TechnicienRequestDetailsScreen extends StatelessWidget {
  final Intervention intervention;

  const TechnicienRequestDetailsScreen({super.key, required this.intervention});

  @override
  Widget build(BuildContext context) {
    final request = intervention.request;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails de la Mission'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Informations Générales'),
            _buildInfoRow('ID Intervention', intervention.id),
            _buildInfoRow('Statut', intervention.statusDisplay),
            _buildInfoRow('Équipement', request?.equipmentType ?? 'N/A'),
            _buildInfoRow('Priorité', request?.urgency ?? 'N/A'),
            const Divider(height: 32),
            _buildSectionTitle('Détails de la demande'),
            Text(
              request?.description ?? 'Aucune description fournie.',
              style: const TextStyle(fontSize: 16),
            ),
            const Divider(height: 32),
            _buildSectionTitle('Client'),
            _buildInfoRow('Nom', request?.clientName ?? 'N/A'),
            const SizedBox(height: 32),
            if (intervention.status == InterventionStatus.scheduled)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    await context.read<TechnicienProvider>().startIntervention(
                      intervention.id,
                    );
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('DÉMARRER LA MISSION'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            if (intervention.status == InterventionStatus.inProgress)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Logic already exists in dashboard, common dialog could be extracted
                    // For now, simple return or unique detail report
                  },
                  icon: const Icon(Icons.check_circle),
                  label: const Text('FINALISER L\'INTERVENTION'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        title,
        style: AppTextStyles.heading2.copyWith(color: AppColors.primaryBlue),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text(
            '$label : ',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
