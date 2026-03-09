import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../models/quote.dart';
import '../providers/quote_provider.dart';

class QuoteCreationBottomSheet extends StatefulWidget {
  const QuoteCreationBottomSheet({super.key});

  @override
  State<QuoteCreationBottomSheet> createState() => _QuoteCreationBottomSheetState();
}

class _QuoteCreationBottomSheetState extends State<QuoteCreationBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _clientNameController = TextEditingController();
  final _clientAddressController = TextEditingController();
  
  final List<_ProductLine> _products = [
    _ProductLine(),
  ];

  @override
  void dispose() {
    _clientNameController.dispose();
    _clientAddressController.dispose();
    for (var product in _products) {
      product.dispose();
    }
    super.dispose();
  }

  void _addProductLine() {
    setState(() {
      _products.add(_ProductLine());
    });
  }

  void _removeProductLine(int index) {
    if (_products.length > 1) {
      setState(() {
        _products[index].dispose();
        _products.removeAt(index);
      });
    }
  }

  double get _totalHT {
    return _products.fold(0.0, (sum, product) {
      final qty = int.tryParse(product.quantityController.text) ?? 0;
      final price = double.tryParse(product.priceController.text) ?? 0.0;
      return sum + (qty * price);
    });
  }

  double get _tva => _totalHT * 0.20;
  double get _totalTTC => _totalHT + _tva;

  void _saveQuote() {
    if (_formKey.currentState!.validate()) {
      if (_products.isEmpty || _products.every((p) => p.nameController.text.isEmpty)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Veuillez ajouter au moins un produit'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final quoteProducts = _products
          .where((p) => p.nameController.text.isNotEmpty)
          .map((p) => QuoteProduct(
                name: p.nameController.text,
                quantity: int.tryParse(p.quantityController.text) ?? 1,
                unitPrice: double.tryParse(p.priceController.text) ?? 0.0,
              ))
          .toList();

      final quoteProvider = Provider.of<QuoteProvider>(context, listen: false);
      final quote = quoteProvider.createQuote(
        clientName: _clientNameController.text,
        clientAddress: _clientAddressController.text,
        products: quoteProducts,
      );

      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Devis ${quote.reference} créé avec succès'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.mediumGray,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Nouveau Devis',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryBlue,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                      color: AppColors.textLight,
                    ),
                  ],
                ),
              ),
              
              const Divider(height: 1),
              
              // Form
              Expanded(
                child: Form(
                  key: _formKey,
                  child: ListView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(20),
                    children: [
                      // Client Information
                      const Text(
                        'Informations Client',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _clientNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nom du client',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Veuillez entrer le nom du client';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _clientAddressController,
                        decoration: const InputDecoration(
                          labelText: 'Adresse du client',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.location_on_outlined),
                        ),
                        maxLines: 2,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Veuillez entrer l\'adresse du client';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),

                      // Products Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Produits / Services',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textDark,
                            ),
                          ),
                          TextButton.icon(
                            onPressed: _addProductLine,
                            icon: const Icon(Icons.add_circle_outline, size: 18),
                            label: const Text('Ajouter'),
                            style: TextButton.styleFrom(
                              foregroundColor: AppColors.primaryBlue,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Product Lines
                      ..._products.asMap().entries.map((entry) {
                        final index = entry.key;
                        final product = entry.value;
                        return _buildProductLine(index, product);
                      }),

                      const SizedBox(height: 24),

                      // Totals
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.lightGray,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            _buildTotalRow('Total HT', _totalHT),
                            const SizedBox(height: 8),
                            _buildTotalRow('TVA (20%)', _tva),
                            const Divider(height: 16),
                            _buildTotalRow('Total TTC', _totalTTC, isBold: true),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 20),

                      // Actions
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.pop(context),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                side: const BorderSide(color: AppColors.mediumGray),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('Annuler'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton(
                              onPressed: _saveQuote,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryBlue,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('Sauvegarder le Devis'),
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProductLine(int index, _ProductLine product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.mediumGray),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Name (full width)
          TextFormField(
            controller: product.nameController,
            decoration: const InputDecoration(
              labelText: 'Nom du produit / service',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.inventory_2_outlined),
            ),
          ),
          const SizedBox(height: 12),
          
          // Quantity and Price row
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextFormField(
                  controller: product.quantityController,
                  decoration: const InputDecoration(
                    labelText: 'Quantité',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.numbers),
                  ),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  onChanged: (_) => setState(() {}),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 3,
                child: TextFormField(
                  controller: product.priceController,
                  decoration: const InputDecoration(
                    labelText: 'Prix unitaire',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.attach_money),
                    suffixText: 'FCFA',
                  ),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))],
                  onChanged: (_) => setState(() {}),
                ),
              ),
              if (_products.length > 1) ...[
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () => _removeProductLine(index),
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  iconSize: 24,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isBold ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          '${amount.toStringAsFixed(0)} FCFA',
          style: TextStyle(
            fontSize: isBold ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: isBold ? AppColors.primaryBlue : AppColors.textDark,
          ),
        ),
      ],
    );
  }
}

class _ProductLine {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController quantityController = TextEditingController(text: '1');
  final TextEditingController priceController = TextEditingController(text: '0');

  void dispose() {
    nameController.dispose();
    quantityController.dispose();
    priceController.dispose();
  }
}
