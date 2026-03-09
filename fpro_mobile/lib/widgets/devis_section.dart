import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../models/quote.dart';
import '../providers/quote_provider.dart';
import 'quote_creation_bottom_sheet.dart';


class DevisSection extends StatefulWidget {
  const DevisSection({super.key});

  @override
  State<DevisSection> createState() => _DevisSectionState();
}

class _DevisSectionState extends State<DevisSection> {
  QuoteStatus? _selectedFilter;

  @override
  Widget build(BuildContext context) {
    return Consumer<QuoteProvider>(
      builder: (context, quoteProvider, child) {
        final filteredQuotes = quoteProvider.getQuotesByStatus(_selectedFilter);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Flexible(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Gestion des Devis',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Consultez et demandez vos devis.',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => const QuoteCreationBottomSheet(),
                    );
                  },
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Nouveau Devis', style: TextStyle(fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Filter Tabs
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('Tous', null),
                  const SizedBox(width: 8),
                  _buildFilterChip('En attente', QuoteStatus.pending),
                  const SizedBox(width: 8),
                  _buildFilterChip('Validés', QuoteStatus.validated),
                  const SizedBox(width: 8),
                  _buildFilterChip('Rejetés', QuoteStatus.rejected),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quotes List
            if (filteredQuotes.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(40),
                  child: Column(
                    children: [
                      Icon(
                        Icons.description_outlined,
                        size: 64,
                        color: AppColors.mediumGray,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _selectedFilter == null
                            ? 'Aucun devis pour le moment'
                            : 'Aucun devis ${_selectedFilter!.label.toLowerCase()}',
                        style: const TextStyle(
                          fontSize: 16,
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filteredQuotes.length,
                itemBuilder: (context, index) {
                  return _buildDevisCard(filteredQuotes[index], quoteProvider);
                },
              ),
          ],
        );
      },
    );
  }

  Widget _buildFilterChip(String label, QuoteStatus? status) {
    final isSelected = _selectedFilter == status;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedFilter = selected ? status : null;
        });
      },
      selectedColor: AppColors.primaryBlue.withOpacity(0.2),
      checkmarkColor: AppColors.primaryBlue,
      labelStyle: TextStyle(
        color: isSelected ? AppColors.primaryBlue : AppColors.textDark,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _buildDevisCard(Quote quote, QuoteProvider quoteProvider) {
    final statusColor = Color(quote.status.colorValue);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quote.reference,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(quote.createdDate),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  quote.status.label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 16, color: AppColors.textLight),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  quote.clientName,
                  style: const TextStyle(fontSize: 13, color: AppColors.textDark),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.lightGray,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Montant TTC',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textLight,
                  ),
                ),
                Text(
                  '${quote.totalTTC.toStringAsFixed(0)} FCFA',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryBlue,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Téléchargement du devis ${quote.reference}...'),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  icon: const Icon(Icons.download_outlined, size: 16),
                  label: const Text('Télécharger PDF', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primaryBlue,
                    side: const BorderSide(color: AppColors.primaryBlue),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    _showQuoteDetails(quote, quoteProvider);
                  },
                  icon: const Icon(Icons.visibility_outlined, size: 16),
                  label: const Text('Détails', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showQuoteDetails(Quote quote, QuoteProvider quoteProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(quote.reference),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildDetailRow('Client', quote.clientName),
              const SizedBox(height: 8),
              _buildDetailRow('Adresse', quote.clientAddress),
              const SizedBox(height: 8),
              _buildDetailRow('Date', _formatDate(quote.createdDate)),
              const SizedBox(height: 8),
              _buildDetailRow('Statut', quote.status.label),
              const Divider(height: 24),
              const Text(
                'Produits',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 12),
              ...quote.products.map((product) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${product.name} (x${product.quantity})',
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                        Text(
                          '${product.totalPrice.toStringAsFixed(0)} FCFA',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  )),
              const Divider(height: 24),
              _buildDetailRow('Total HT', '${quote.totalHT.toStringAsFixed(0)} FCFA'),
              const SizedBox(height: 4),
              _buildDetailRow('TVA (20%)', '${quote.tva.toStringAsFixed(0)} FCFA'),
              const SizedBox(height: 8),
              _buildDetailRow(
                'Total TTC',
                '${quote.totalTTC.toStringAsFixed(0)} FCFA',
                isBold: true,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fermer'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            '$label:',
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textLight,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: isBold ? AppColors.primaryBlue : AppColors.textDark,
            ),
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
