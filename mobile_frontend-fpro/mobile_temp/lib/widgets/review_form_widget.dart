import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/maintenance_request.dart';
import '../models/review.dart';
import '../providers/maintenance_provider.dart';
import '../features/auth/providers/auth_provider.dart';
import '../utils/constants.dart';

class ReviewFormWidget extends StatefulWidget {
  final MaintenanceRequest request;

  const ReviewFormWidget({super.key, required this.request});

  @override
  State<ReviewFormWidget> createState() => _ReviewFormWidgetState();
}

class _ReviewFormWidgetState extends State<ReviewFormWidget> {
  int _rating = 0;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;
  Review? _existingReview;
  bool _isLoadingReview = true;

  @override
  void initState() {
    super.initState();
    _loadReview();
  }

  Future<void> _loadReview() async {
    final provider = context.read<MaintenanceProvider>();
    final review = await provider.getReview(widget.request.id);
    if (mounted) {
      setState(() {
        _existingReview = review;
        _isLoadingReview = false;
      });
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner une note')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    print('DEBUG: ReviewFormWidget._submitReview started');
    print('DEBUG: rating: $_rating');
    print('DEBUG: request.id: ${widget.request.id}');
    print('DEBUG: request.technicianId: ${widget.request.technicianId}');

    try {
      final authProvider = context.read<AuthProvider>();
      final maintenanceProvider = context.read<MaintenanceProvider>();

      // Extraction de l'ID du technicien depuis la maintenance
      // Note: Le backend attend technician_id qui est l'ID de l'utilisateur
      // Dans notre modèle frontend, on n'a pas forcément l'ID utilisateur du technicien,
      // mais le backend peut le retrouver via la maintenance.
      // Cependant, pour être propre on passe ce qu'on peut.

      /* if (widget.request.technicianId == null) {
        // Afficher un message d'erreur
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Impossible de soumettre un avis : aucun technicien assigné',
            ),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      } */

      await maintenanceProvider.postReview(
        maintenanceId: widget.request.id,
        rating: _rating,
        comment: _commentController.text,
        technicianId: widget
            .request
            .technicianId, // [Changement] Plus de ! car c'est géré par le backend
        clientId: authProvider.user?.id ?? '',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Avis envoyé avec succès'),
            backgroundColor: Colors.green,
          ),
        );
        _loadReview();
      }
    } catch (e) {
      print('DEBUG: ReviewFormWidget._submitReview error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingReview) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_existingReview != null) {
      return _buildReviewDisplay();
    }

    return _buildReviewForm();
  }

  Widget _buildReviewDisplay() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primaryBlue.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Votre avis',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    index < _existingReview!.rating
                        ? Icons.star
                        : Icons.star_border,
                    color: Colors.amber,
                    size: 20,
                  );
                }),
              ),
            ],
          ),
          if (_existingReview!.comment != null &&
              _existingReview!.comment!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              _existingReview!.comment!,
              style: const TextStyle(fontStyle: FontStyle.italic),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildReviewForm() {
    return Container(
      padding: const EdgeInsets.all(16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Donner votre avis',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 12),
          const Text('Notez l\'intervention :'),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              return IconButton(
                icon: Icon(
                  index < _rating ? Icons.star : Icons.star_border,
                  color: Colors.amber,
                  size: 32,
                ),
                onPressed: () => setState(() => _rating = index + 1),
              );
            }),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _commentController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Votre commentaire (optionnel)...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: Colors.grey[50],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submitReview,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
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
                  : const Text('Envoyer l\'avis'),
            ),
          ),
        ],
      ),
    );
  }
}
