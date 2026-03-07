import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../utils/constants.dart';
import 'registration_screen.dart';
import 'login_screen.dart';
import 'admin_login_screen.dart';
import 'pro_login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with logo
              Container(
                padding: const EdgeInsets.all(20),
                color: AppColors.white,
                child: Image.asset('assets/images/logo.png', height: 50),
              ),

              // Hero Section
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [const Color(0xFF2E3F8F), const Color(0xFF4A5FC1)],
                  ),
                ),
                child: Stack(
                  children: [
                    // Decorative circles
                    Positioned(
                      right: -50,
                      top: 20,
                      child: Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                    ),

                    // "Espace Pro" Dropdown
                    Positioned(
                      top: 10,
                      right: 10,
                      child: PopupMenuButton<String>(
                        onSelected: (value) {
                          if (value == 'agent') {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ProLoginScreen(
                                  expectedRole: 'agent',
                                  title: 'Espace Agent',
                                ),
                              ),
                            );
                          } else if (value == 'technicien') {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ProLoginScreen(
                                  expectedRole:
                                      'technicien', // Matches backend standard
                                  title: 'Espace Technicien',
                                ),
                              ),
                            );
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.5),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Text(
                                'Espace Pro',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(width: 4),
                              Icon(Icons.arrow_drop_down, color: Colors.white),
                            ],
                          ),
                        ),
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'agent',
                            child: Row(
                              children: [
                                Icon(
                                  Icons.support_agent,
                                  color: Color(0xFF0ea5e9),
                                ),
                                SizedBox(width: 8),
                                Text('Agent'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'technicien',
                            child: Row(
                              children: [
                                Icon(Icons.build, color: Color(0xFF10b981)),
                                SizedBox(width: 8),
                                Text('Technicien'),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(30),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const Text(
                            'Services professionnels\nadaptés aux entreprises',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 15),
                          const Text(
                            'Support informatique, maintenance\net solutions digitales pour vos besoins',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 40),

                          // Floating icons in a CIRCLE
                          SizedBox(
                            height: 200,
                            child: LayoutBuilder(
                              builder: (context, constraints) {
                                final centerX = constraints.maxWidth / 2;
                                const centerY = 100.0;
                                const radius = 75.0;
                                final icons = [
                                  Icons.shopping_bag,
                                  Icons.computer,
                                  Icons.phone_android,
                                  Icons.lock,
                                  Icons.settings,
                                ];

                                return Stack(
                                  clipBehavior: Clip.none,
                                  children: List.generate(icons.length, (
                                    index,
                                  ) {
                                    final angle =
                                        (index * 2 * math.pi / icons.length) -
                                        (math.pi / 2);
                                    final x =
                                        centerX + radius * math.cos(angle);
                                    final y =
                                        centerY + radius * math.sin(angle);
                                    return _buildFloatingIcon(
                                      icons[index],
                                      x - 22,
                                      y - 22,
                                    );
                                  }),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 40),

                          // Buttons
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const RegistrationScreen(),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF28A745),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 15,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: const Text(
                                    'Créer votre compte',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 15),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const LoginScreen(),
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.add, size: 18),
                                  label: const Text('Services'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    side: const BorderSide(color: Colors.white),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 15,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Services Section
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'La plateforme tout - en - un pour votre entreprise',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryBlue,
                      ),
                    ),
                    const SizedBox(height: 25),

                    // Service Cards - HORIZONTAL
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          SizedBox(
                            width: 280,
                            child: _buildServiceCard(
                              icon: Icons.print,
                              title: 'Consommables',
                              description:
                                  'Papier, encres, accessoires\ninformatiques',
                              context: context,
                            ),
                          ),
                          const SizedBox(width: 15),
                          SizedBox(
                            width: 280,
                            child: _buildServiceCard(
                              icon: Icons.build,
                              title: 'Maintenance',
                              description:
                                  'Maintenance équipements\ninformatiques et bureautiques',
                              context: context,
                            ),
                          ),
                          const SizedBox(width: 15),
                          SizedBox(
                            width: 280,
                            child: _buildServiceCard(
                              icon: Icons.laptop,
                              title: 'Solutions Digitales',
                              description:
                                  'Développement web, applications et\nsolutions sur mesure',
                              context: context,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Footer
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                color: AppColors.darkBlue,
                child: GestureDetector(
                  onDoubleTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AdminLoginScreen(),
                      ),
                    );
                  },
                  child: const Text(
                    '© 2026 F-PRO CONSULTING. Tous droits réservés.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFloatingIcon(IconData icon, double left, double top) {
    return Positioned(
      left: left,
      top: top,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(icon, color: AppColors.statusOrange, size: 20),
      ),
    );
  }

  Widget _buildServiceCard({
    required IconData icon,
    required String title,
    required String description,
    required BuildContext context,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.mediumGray),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 50, color: AppColors.darkGray),
          const SizedBox(height: 15),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textLight,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 15),
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            child: const Text('Découvrir'),
          ),
        ],
      ),
    );
  }
}
