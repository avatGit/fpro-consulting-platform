import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/agent_provider.dart';
import '../utils/constants.dart';

class TechnicienDetailsDialog extends StatelessWidget {
  final String userId;

  const TechnicienDetailsDialog({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AgentProvider>();
    final techniciens = provider.techniciens;

    if (techniciens.isEmpty) {
      return const AlertDialog(
        title: Text('Détails du Technicien'),
        content: Text('Aucun technicien trouvé dans la liste.'),
      );
    }

    final tech = techniciens.firstWhere(
      (t) => t.id == userId,
      orElse: () => techniciens.first,
    );

    return AlertDialog(
      title: const Text('Détails du Technicien'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
              child: Text(tech.initials, style: AppTextStyles.heading2),
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.person, 'Nom', tech.name),
          _buildInfoRow(Icons.email, 'Email', tech.email),
          _buildInfoRow(Icons.phone, 'Téléphone', tech.phone),
          _buildInfoRow(Icons.work, 'Expérience', 'N/A'),
          _buildInfoRow(Icons.star, 'Spécialités', 'Multi-services'),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('FERMER'),
        ),
      ],
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primaryBlue),
          const SizedBox(width: 12),
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.bold)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
