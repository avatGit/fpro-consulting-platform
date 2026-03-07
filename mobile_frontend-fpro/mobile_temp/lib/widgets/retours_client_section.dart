import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/maintenance_provider.dart';
import '../models/maintenance_request.dart';
import '../models/review.dart';
import '../widgets/review_form_widget.dart';
import '../utils/constants.dart';

class RetoursClientSection extends StatefulWidget {
  const RetoursClientSection({super.key});

  @override
  State<RetoursClientSection> createState() => _RetoursClientSectionState();
}

class _RetoursClientSectionState extends State<RetoursClientSection> {
  int _activeTabIndex =
      0; // [Ajout] Pour gérer les onglets manuellement sans Expanded/TabBarView

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<MaintenanceProvider>();
      provider.fetchRequests();
      provider.fetchAllReviews();
      provider.fetchMyReviews();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // [Ajout] Selecteur d'onglets manuel pour éviter les conflits de hauteur
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTabButton('À noter', 0),
                const SizedBox(width: 8),
                _buildTabButton('Avis publics', 1),
                const SizedBox(width: 8),
                _buildTabButton('Mes avis', 2),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        // [Changement] Affichage direct sans Expanded/TabBarView
        _buildActiveTabContent(),
      ],
    );
  }

  Widget _buildTabButton(String label, int index) {
    final isSelected = _activeTabIndex == index;
    return InkWell(
      onTap: () => setState(() => _activeTabIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryBlue : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primaryBlue : Colors.grey[300]!,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[600],
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildActiveTabContent() {
    switch (_activeTabIndex) {
      case 0:
        return _buildToReviewList();
      case 1:
        return _buildAllReviewsList();
      case 2:
        return _buildMyReviewsHistory();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildToReviewList() {
    return Consumer<MaintenanceProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.requests.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final toReview = provider.requests.where((r) {
          final isClosed = r.status == MaintenanceStatus.closed;
          final hasNoReview =
              !provider.reviewsCache.containsKey(r.id) ||
              provider.reviewsCache[r.id] == null;
          return isClosed && hasNoReview;
        }).toList();

        if (toReview.isEmpty) {
          return _buildEmptyState(
            Icons.check_circle_outline,
            'Aucune maintenance en attente d\'avis',
          );
        }

        return ListView.builder(
          shrinkWrap:
              true, // [Important] Indispensable pour être dans un SingleChildScrollView
          physics: const NeverScrollableScrollPhysics(), // [Important]
          padding: EdgeInsets.zero,
          itemCount: toReview.length,
          itemBuilder: (context, index) {
            final request = toReview[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                title: Text(request.description),
                subtitle: Text(
                  'Technicien: ${request.technicienName ?? "Inconnu"}',
                ),
                trailing: ElevatedButton(
                  onPressed: () => _showReviewForm(request),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Noter'),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildAllReviewsList() {
    return Consumer<MaintenanceProvider>(
      builder: (context, provider, child) {
        print(
          'DEBUG: RetoursClientSection._buildAllReviewsList builder - reviews: ${provider.allReviews.length}',
        );

        if (provider.isLoading && provider.allReviews.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final reviews = provider.allReviews;

        if (reviews.isEmpty) {
          return _buildEmptyState(
            Icons.public,
            'Aucun avis public pour le moment',
          );
        }

        return ListView.builder(
          shrinkWrap: true, // [Important]
          physics: const NeverScrollableScrollPhysics(), // [Important]
          padding: EdgeInsets.zero,
          itemCount: reviews.length,
          itemBuilder: (context, index) =>
              _buildReviewCard(reviews[index], showClient: true),
        );
      },
    );
  }

  Widget _buildMyReviewsHistory() {
    return Consumer<MaintenanceProvider>(
      builder: (context, provider, child) {
        print(
          'DEBUG: RetoursClientSection._buildMyReviewsHistory builder - reviews: ${provider.myReviews.length}',
        );

        if (provider.isLoading && provider.myReviews.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final reviews = provider.myReviews;

        if (reviews.isEmpty) {
          return _buildEmptyState(
            Icons.history,
            'Vous n\'avez pas encore laissé d\'avis',
          );
        }

        return ListView.builder(
          shrinkWrap: true, // [Important]
          physics: const NeverScrollableScrollPhysics(), // [Important]
          padding: EdgeInsets.zero,
          itemCount: reviews.length,
          itemBuilder: (context, index) =>
              _buildReviewCard(reviews[index], showClient: false),
        );
      },
    );
  }

  Widget _buildEmptyState(IconData icon, String text) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(text, style: const TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(Review review, {bool showClient = true}) {
    print(
      'DEBUG: RetoursClientSection._buildReviewCard - rendering review: ${review.id}',
    );
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    review.maintenanceDescription ?? 'Maintenance',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
                _buildStars(review.rating),
              ],
            ),
            const SizedBox(height: 12),
            if (showClient) ...[
              _buildInfoRow(
                Icons.person,
                'Client: ${review.clientName ?? "Anonyme"}',
              ),
              const SizedBox(height: 4),
            ],
            _buildInfoRow(
              Icons.engineering,
              'Expert: ${review.technicianName ?? "Inconnu"}',
            ),
            const SizedBox(height: 12),
            if (review.comment != null && review.comment!.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  review.comment!,
                  style: const TextStyle(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.bottomRight,
              child: Text(
                review.createdAt != null
                    ? DateFormat('dd/MM/yyyy HH:mm').format(review.createdAt!)
                    : 'Date inconnue',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.primaryBlue),
        const SizedBox(width: 8),
        Text(text, style: TextStyle(fontSize: 12, color: Colors.grey[700])),
      ],
    );
  }

  void _showReviewForm(MaintenanceRequest request) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SingleChildScrollView(child: ReviewFormWidget(request: request)),
      ),
    ).then((_) {
      final provider = context.read<MaintenanceProvider>();
      provider.fetchRequests();
      provider.fetchAllReviews();
      provider.fetchMyReviews();
    });
  }

  Widget _buildStars(int rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star : Icons.star_border,
          color: Colors.amber,
          size: 16,
        );
      }),
    );
  }
}
