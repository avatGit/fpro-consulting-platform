import 'package:flutter/material.dart';
import 'package:fpro_mobile/services/maintenance_service.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../models/maintenance_request.dart';
import '../providers/maintenance_provider.dart';
import '../screens/maintenance_details_screen.dart';

class MaintenanceSection extends StatefulWidget {
  const MaintenanceSection({super.key});

  @override
  State<MaintenanceSection> createState() => _MaintenanceSectionState();
}

class _MaintenanceSectionState extends State<MaintenanceSection> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MaintenanceProvider>().fetchRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    final maintenanceProvider = context.watch<MaintenanceProvider>();
    final requests = maintenanceProvider.requests;
    final isLoading = maintenanceProvider.isLoading;
    final error = maintenanceProvider.error;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        const Text(
          'Nouvelle Demande',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.primaryBlue,
          ),
        ),
        const SizedBox(height: 12),
        _buildNewRequestForm(),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Mes Demandes',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh, color: AppColors.primaryBlue),
              onPressed: () =>
                  context.read<MaintenanceProvider>().fetchRequests(),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // List of Requests
        if (isLoading && requests.isEmpty)
          const Center(child: CircularProgressIndicator())
        else if (error != null)
          Center(child: Text('Erreur: $error'))
        else if (requests.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text(
                'Aucune demande de maintenance en cours.',
                style: TextStyle(color: AppColors.textLight),
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: requests.length,
            itemBuilder: (context, index) {
              final request = requests[index];
              return _buildRequestCard(request);
            },
          ),
      ],
    );
  }

  Widget _buildRequestCard(MaintenanceRequest request) {
    return InkWell(
      onTap: () {
        // [Changement] Navigation vers les détails de la maintenance pour confirmation
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                MaintenanceDetailsScreen(requestId: request.id),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  request.equipmentType,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                _buildStatusChip(
                  request.statusLabel,
                  _getStatusColor(request.status),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              request.description,
              style: const TextStyle(color: AppColors.textDark),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(
                  Icons.calendar_today,
                  size: 14,
                  color: AppColors.textLight,
                ),
                const SizedBox(width: 4),
                Text(
                  '${request.date.day}/${request.date.month}/${request.date.year}',
                  style: const TextStyle(
                    color: AppColors.textLight,
                    fontSize: 12,
                  ),
                ),
                if (request.technicienName != null) ...[
                  const SizedBox(width: 16),
                  const Icon(
                    Icons.person,
                    size: 14,
                    color: AppColors.textLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    request.technicienName!,
                    style: const TextStyle(
                      color: AppColors.textLight,
                      fontSize: 12,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(MaintenanceStatus status) {
    switch (status) {
      case MaintenanceStatus.pending:
        return Colors.orange;
      case MaintenanceStatus.assigned:
      case MaintenanceStatus.inProgress:
        return Colors.blue;
      case MaintenanceStatus.completedByTechnician:
        return Colors.green;
      case MaintenanceStatus.closed:
        return Colors.teal;
      case MaintenanceStatus.cancelled:
        return Colors.red;
    }
  }

  Widget _buildStatusChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // Controllers
  final _typeController = TextEditingController();
  final _descriptionController = TextEditingController();

  // State
  String _selectedUrgency = 'moyenne'; // Default matching backend
  bool _isSubmitting = false;

  @override
  void dispose() {
    _typeController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (_typeController.text.isEmpty || _descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez remplir tous les champs')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Create request object
      // Note: ID, Date, ClientName handled by backend/frontend model defaults or ignored on create
      final newRequest = MaintenanceRequest(
        id: '', // Backend generates
        equipmentType: _typeController.text,
        description: _descriptionController.text,
        urgency: _selectedUrgency,
        date: DateTime.now(),
        clientName: '', // Backend handles
      );

      // [Changement] Utilisation du Provider pour la création et le rafraîchissement
      await MaintenanceService().createRequest(newRequest);
      await context.read<MaintenanceProvider>().fetchRequests();

      // Reset form
      _typeController.clear();
      _descriptionController.clear();
      setState(() => _selectedUrgency = 'moyenne');

      // Refresh list
      // Refresh list via provider
      await context.read<MaintenanceProvider>().fetchRequests();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Demande envoyée avec succès'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Widget _buildNewRequestForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildTextField(
            'Type d\'équipement',
            'Ex: Imprimante, PC, Serveur',
            controller: _typeController,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            'Description du problème',
            'Décrivez la panne...',
            maxLines: 4,
            controller: _descriptionController,
          ),
          const SizedBox(height: 16),
          const Text(
            'Urgence',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildUrgencyOption('Faible', 'faible', Colors.green),
              const SizedBox(width: 8),
              _buildUrgencyOption('Moyenne', 'moyenne', Colors.orange),
              const SizedBox(width: 8),
              _buildUrgencyOption('Haute', 'haute', Colors.red),
            ],
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitRequest,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Text('Envoyer la demande'),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(
    String label,
    String hint, {
    int maxLines = 1,
    required TextEditingController controller,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
            filled: true,
            fillColor: AppColors.lightGray,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }

  Widget _buildUrgencyOption(String label, String value, Color color) {
    final isSelected = _selectedUrgency == value;
    return InkWell(
      onTap: () {
        setState(() => _selectedUrgency = value);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color : color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : color,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
