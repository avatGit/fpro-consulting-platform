import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/constants.dart';
import '../providers/user_profile_provider.dart';

class UserProfileSection extends StatefulWidget {
  const UserProfileSection({super.key});

  @override
  State<UserProfileSection> createState() => _UserProfileSectionState();
}

class _UserProfileSectionState extends State<UserProfileSection> {
  bool _isEditing = false;
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _companyController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    final profile = context.read<UserProfileProvider>().profile;
    _nameController = TextEditingController(text: profile.name);
    _emailController = TextEditingController(text: profile.email);
    _companyController = TextEditingController(text: profile.company);
    _phoneController = TextEditingController(text: profile.phone);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _companyController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      if (!_isEditing) {
        // Reset controllers if cancelled
        final profile = context.read<UserProfileProvider>().profile;
        _nameController.text = profile.name;
        _emailController.text = profile.email;
        _companyController.text = profile.company;
        _phoneController.text = profile.phone;
      }
    });
  }

  void _saveChanges() {
    final provider = context.read<UserProfileProvider>();
    provider.updatePersonalInfo(
      name: _nameController.text,
      email: _emailController.text,
      company: _companyController.text,
      phone: _phoneController.text,
    );
    
    setState(() {
      _isEditing = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Profil mis à jour avec succès'),
        backgroundColor: Colors.green,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<UserProfileProvider>(
      builder: (context, profileProvider, child) {
        final profile = profileProvider.profile;
        
        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primaryBlue,
                      AppColors.primaryBlue.withAlpha(204),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    // Avatar
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
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
                    const SizedBox(height: 16),
                    
                    // Name
                    Text(
                      profile.name,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    
                    // Role
                    Text(
                      profile.role,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withAlpha(230),
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFD700),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'CLIENT PREMIUM',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Stats
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildStat('${profile.totalOrders}', 'COMMANDES'),
                        Container(
                          height: 30,
                          width: 1,
                          color: Colors.white.withAlpha(77),
                          margin: const EdgeInsets.symmetric(horizontal: 24),
                        ),
                        _buildStat('${profile.totalAccounts}', 'COMPTES'),
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Personal Information Section
              _buildSection(
                title: 'Informations Personnelles',
                child: Column(
                  children: [
                    _buildInfoField(
                      label: 'NOM COMPLET',
                      value: profile.name,
                      controller: _nameController,
                      isEditing: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    _buildInfoField(
                      label: 'EMAIL PROFESSIONNEL',
                      value: profile.email,
                      controller: _emailController,
                      isEditing: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    _buildInfoField(
                      label: 'ENTREPRISE',
                      value: profile.company,
                      controller: _companyController,
                      isEditing: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    _buildInfoField(
                      label: 'TÉLÉPHONE',
                      value: profile.phone,
                      controller: _phoneController,
                      isEditing: _isEditing,
                    ),
                    const SizedBox(height: 16),
                    _buildInfoField(
                      label: 'MEMBRE DEPUIS',
                      value: _formatDate(profile.memberSince),
                      isEditing: false,
                      readOnly: true,
                    ),
                    const SizedBox(height: 20),
                    
                    // Edit/Save Button
                    SizedBox(
                      width: double.infinity,
                      child: _isEditing
                          ? Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: _toggleEditMode,
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      side: const BorderSide(color: AppColors.mediumGray),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                    ),
                                    child: const Text('Annuler'),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  flex: 2,
                                  child: ElevatedButton(
                                    onPressed: _saveChanges,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primaryBlue,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                    ),
                                    child: const Text('Enregistrer'),
                                  ),
                                ),
                              ],
                            )
                          : OutlinedButton(
                              onPressed: _toggleEditMode,
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                side: const BorderSide(color: AppColors.primaryBlue),
                                foregroundColor: AppColors.primaryBlue,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              child: const Text('Modifier mes Informations'),
                            ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Security & Account Section
              _buildSection(
                title: 'Sécurité & Compte',
                child: Column(
                  children: [
                    _buildPasswordRow(),
                    const SizedBox(height: 16),
                    _buildToggleRow(
                      label: 'Authentification à deux facteurs',
                      subtitle: 'Ajoutez une couche de sécurité supplémentaire',
                      value: profile.twoFactorAuth,
                      onChanged: (value) {
                        profileProvider.toggleTwoFactorAuth();
                      },
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Preferences Section
              _buildSection(
                title: 'Préférences',
                child: Column(
                  children: [
                    _buildToggleRow(
                      label: 'Notifications Email',
                      subtitle: 'Recevez des alertes pour vos commandes',
                      value: profile.emailNotifications,
                      onChanged: (value) {
                        profileProvider.toggleEmailNotifications();
                      },
                    ),
                    const SizedBox(height: 16),
                    _buildLanguageRow(profile.language, profileProvider),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.white.withAlpha(204),
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildSection({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildInfoField({
    required String label,
    required String value,
    TextEditingController? controller,
    bool isEditing = false,
    bool readOnly = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.textLight,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        if (isEditing && !readOnly && controller != null)
          TextField(
            controller: controller,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(6),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textDark,
            ),
          )
        else
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textDark,
            ),
          ),
      ],
    );
  }

  Widget _buildPasswordRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Mot de passe',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Dernière modification il y a 2 mois',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
        ),
        TextButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Fonctionnalité de changement de mot de passe à venir'),
              ),
            );
          },
          child: const Text('Changer'),
        ),
      ],
    );
  }

  Widget _buildToggleRow({
    required String label,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: AppColors.primaryBlue,
        ),
      ],
    );
  }

  Widget _buildLanguageRow(String currentLanguage, UserProfileProvider provider) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Langue de l\'interface',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
        ),
        DropdownButton<String>(
          value: currentLanguage,
          underline: const SizedBox(),
          items: const [
            DropdownMenuItem(value: 'Français', child: Text('Français')),
            DropdownMenuItem(value: 'English', child: Text('English')),
          ],
          onChanged: (value) {
            if (value != null) {
              provider.updateLanguage(value);
            }
          },
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }
}
