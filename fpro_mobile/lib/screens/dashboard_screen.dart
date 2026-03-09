import 'package:flutter/material.dart';
import '../utils/constants.dart';
import 'home_screen.dart';
import '../widgets/dashboard_overview.dart';
import '../widgets/products_section.dart';
import '../widgets/maintenance_section.dart';
import '../widgets/locations_section.dart';
import '../widgets/devis_section.dart';
import '../widgets/commandes_section.dart';
import '../widgets/suivi_section.dart';
import '../widgets/user_profile_section.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _selectedSection = 'Tableau de bord';

  final List<Map<String, dynamic>> _menuItems = [
    {'icon': Icons.dashboard, 'title': 'Tableau de bord'},
    {'icon': Icons.shopping_cart, 'title': 'Produits'},
    {'icon': Icons.build, 'title': 'Maintenance'},
    {'icon': Icons.event, 'title': 'Locations'},
    {'icon': Icons.shopping_bag, 'title': 'Commandes'},
    {'icon': Icons.track_changes, 'title': 'Suivi'},
    {'icon': Icons.description, 'title': 'Devis'},
    {'icon': Icons.person, 'title': 'Profil'},
    {'icon': Icons.reply, 'title': 'Retours client'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.lightGray,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation Bar (Blue)
            Container(
              padding: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primaryBlue,
                    AppColors.lightBlue,
                  ],
                ),
              ),
              child: Column(
                children: [
                  // Header with logo, search, and user
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        // Logo
                        Image.asset(
                          'assets/images/logo.png',
                          height: 35,
                        ),
                        const SizedBox(width: 12),
                        
                        // Search Bar
                        Expanded(
                          child: Container(
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: TextField(
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Rechercher...',
                                hintStyle: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 14,
                                ),
                                prefixIcon: Icon(
                                  Icons.search,
                                  color: Colors.white.withOpacity(0.7),
                                  size: 20,
                                ),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        
                        // Notification Icon
                        Stack(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.notifications_outlined),
                              color: Colors.white,
                              onPressed: () {},
                            ),
                            Positioned(
                              right: 8,
                              top: 8,
                              child: Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        // User Avatar
                        PopupMenuButton(
                          child: Container(
                            width: 35,
                            height: 35,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Text(
                                'US',
                                style: TextStyle(
                                  color: AppColors.primaryBlue,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'profile',
                              child: Row(
                                children: [
                                  Icon(Icons.person, size: 18),
                                  SizedBox(width: 10),
                                  Text('Profil'),
                                ],
                              ),
                            ),
                            const PopupMenuItem(
                              value: 'logout',
                              child: Row(
                                children: [
                                  Icon(Icons.logout, size: 18),
                                  SizedBox(width: 10),
                                  Text('Déconnexion'),
                                ],
                              ),
                            ),
                          ],
                          onSelected: (value) {
                            if (value == 'profile') {
                              setState(() {
                                _selectedSection = 'Profil';
                              });
                            } else if (value == 'logout') {
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const HomeScreen(),
                                ),
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                  
                  // Horizontal Scrollable Menu
                  SizedBox(
                    height: 50,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _menuItems.length,
                      itemBuilder: (context, index) {
                        final item = _menuItems[index];
                        final isSelected = _selectedSection == item['title'];
                        
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedSection = item['title'];
                            });
                          },
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected 
                                  ? Colors.white 
                                  : Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  item['icon'],
                                  size: 18,
                                  color: isSelected 
                                      ? AppColors.primaryBlue 
                                      : Colors.white,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  item['title'],
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                    color: isSelected 
                                        ? AppColors.primaryBlue 
                                        : Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            
            // Main Content Area
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: _buildSectionContent(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionContent() {
    switch (_selectedSection) {
      case 'Tableau de bord':
        return const DashboardOverview();
      case 'Produits':
        return const ProductsSection();
      case 'Maintenance':
        return const MaintenanceSection();
      case 'Locations':
        return const LocationsSection();
      case 'Devis':
        return const DevisSection();
      case 'Commandes':
        return const CommandesSection();
      case 'Suivi':
        return const SuiviSection();
      case 'Profil':
        return const UserProfileSection();
      default:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 100),
              Icon(Icons.construction, size: 100, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text(
                'La section $_selectedSection est en cours de développement.',
                style: const TextStyle(color: AppColors.textLight),
              ),
            ],
          ),
        );
    }
  }
}
