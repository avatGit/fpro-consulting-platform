import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../models/product.dart';
import '../models/rental_item.dart';
import '../providers/admin_provider.dart';

class AdminProductDialog extends StatefulWidget {
  final dynamic item;
  final bool isRental;

  const AdminProductDialog({super.key, this.item, required this.isRental});

  @override
  State<AdminProductDialog> createState() => _AdminProductDialogState();
}

class _AdminProductDialogState extends State<AdminProductDialog> {
  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _priceController;
  late TextEditingController _stockController;
  String _selectedCategory = 'Papier';

  @override
  void initState() {
    super.initState();
    final name = widget.isRental ? (widget.item as RentalItem?)?.name : (widget.item as Product?)?.name;
    final desc = widget.isRental ? (widget.item as RentalItem?)?.description : (widget.item as Product?)?.description;
    final price = widget.isRental ? (widget.item as RentalItem?)?.pricePerDay : (widget.item as Product?)?.price;
    final stock = widget.isRental ? 0 : (widget.item as Product?)?.stock;

    _nameController = TextEditingController(text: name ?? '');
    _descController = TextEditingController(text: desc ?? '');
    _priceController = TextEditingController(text: price?.toStringAsFixed(0) ?? '');
    _stockController = TextEditingController(text: stock?.toString() ?? '0');
    
    if (!widget.isRental && widget.item != null) {
      _selectedCategory = (widget.item as Product).category;
    } else if (widget.isRental) {
      _selectedCategory = 'Matériel';
    }
  }

  void _save() {
    if (_nameController.text.isEmpty) return;

    if (widget.isRental) {
      final item = RentalItem(
        id: (widget.item as RentalItem?)?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        name: _nameController.text,
        description: _descController.text,
        pricePerDay: double.tryParse(_priceController.text) ?? 0,
        available: true,
      );
      if (widget.item == null) {
        context.read<AdminProvider>().addRental(item);
      } else {
        context.read<AdminProvider>().updateRental(item);
      }
    } else {
      final product = Product(
        id: (widget.item as Product?)?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        name: _nameController.text,
        description: _descController.text,
        price: double.tryParse(_priceController.text) ?? 0,
        stock: int.tryParse(_stockController.text) ?? 0,
        imageUrl: '',
        category: _selectedCategory,
      );
      if (widget.item == null) {
        context.read<AdminProvider>().addProduct(product);
      } else {
        context.read<AdminProvider>().updateProduct(product);
      }
    }

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(24),
        child: ListView(
          controller: controller,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.item == null ? 'Ajouter un article' : 'Modifier l\'article',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildTextField(_nameController, 'Nom de l\'article', 'Ex: Imprimante HP'),
            const SizedBox(height: 16),
            _buildTextField(_descController, 'Description', 'Détails de l\'article...', maxLines: 3),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildTextField(_priceController, 'Prix (FCFA)', '0', isNumber: true)),
                const SizedBox(width: 16),
                Expanded(child: _buildTextField(_stockController, 'Stock', '0', isNumber: true)),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Catégorie', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: ['Papier', 'Encres', 'Accessoires', 'Matériel'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  onSelected: (val) {
                    if (val) setState(() => _selectedCategory = cat);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Enregistrer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, String hint, {bool isNumber = false, int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.grey[100],
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }
}
