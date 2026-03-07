import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../providers/technicien_provider.dart';

class TechnicianProfileScreen extends StatefulWidget {
  const TechnicianProfileScreen({super.key});

  @override
  State<TechnicianProfileScreen> createState() =>
      _TechnicianProfileScreenState();
}

class _TechnicianProfileScreenState extends State<TechnicianProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _phoneController;
  late List<String> _skills;
  final TextEditingController _skillController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // [Fix] Trigger profile fetch to ensure we have data
    Future.microtask(() => context.read<TechnicienProvider>().fetchProfile());

    final profile = context.read<TechnicienProvider>().profile;
    _phoneController = TextEditingController(text: profile?.phone ?? '');
    _skills = List.from(profile?.skills ?? []);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _skillController.dispose();
    super.dispose();
  }

  void _addSkill() {
    if (_skillController.text.isNotEmpty) {
      setState(() {
        _skills.add(_skillController.text.trim());
        _skillController.clear();
      });
    }
  }

  void _removeSkill(String skill) {
    setState(() {
      _skills.remove(skill);
    });
  }

  void _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      final success = await context.read<TechnicienProvider>().updateProfile({
        'phone': _phoneController.text,
        'skills': _skills,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success ? 'Profil mis à jour' : 'Erreur lors de la mise à jour',
            ),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil Technicien'),
        backgroundColor: AppColors.primaryBlue,
        foregroundColor: Colors.white,
      ),
      body: Consumer<TechnicienProvider>(
        builder: (context, provider, child) {
          final profile = provider.profile;

          // [Fix] Sync controllers and skills if data was loaded after initState
          if (profile != null &&
              _phoneController.text.isEmpty &&
              _skills.isEmpty) {
            _phoneController.text = profile.phone;
            _skills = List.from(profile.skills);
          }

          if (provider.isLoading && profile == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (profile == null) {
            return const Center(child: Text('Erreur de chargement du profil'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
                      child: Text(
                        profile.initials,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.star,
                              color: Colors.amber,
                              size: 24,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              profile.averageRating.toString(),
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              ' (${profile.reviewCount} avis)',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Note moyenne',
                          style: TextStyle(
                            color: AppColors.textLight,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildTextField(
                    'Nom complet',
                    TextEditingController(text: profile.name),
                    enabled: false,
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    'Email',
                    TextEditingController(text: profile.email),
                    enabled: false,
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    'Téléphone',
                    _phoneController,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Mes Compétences',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _skills
                        .map(
                          (skill) => Chip(
                            label: Text(skill),
                            onDeleted: () => _removeSkill(skill),
                            deleteIconColor: Colors.red,
                            backgroundColor: AppColors.primaryBlue.withOpacity(
                              0.1,
                            ),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _skillController,
                          decoration: const InputDecoration(
                            hintText: 'Ajouter une compétence...',
                            isDense: true,
                          ),
                          onSubmitted: (_) => _addSkill(),
                        ),
                      ),
                      IconButton(
                        onPressed: _addSkill,
                        icon: const Icon(
                          Icons.add_circle,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Enregistrer les modifications'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTextField(
    String label,
    TextEditingController controller, {
    TextInputType? keyboardType,
    bool enabled = true,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      enabled: enabled,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: !enabled,
        fillColor: enabled ? null : Colors.grey[200],
      ),
    );
  }
}
