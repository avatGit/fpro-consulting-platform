import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'providers/cart_provider.dart';
import 'providers/quote_provider.dart';
import 'providers/user_profile_provider.dart';
import 'providers/admin_provider.dart';
import 'providers/agent_provider.dart';
import 'features/auth/providers/auth_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/technicien_provider.dart';
import 'providers/maintenance_provider.dart';
import 'core/network/api_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize API Client
  ApiClient().initialize();

  runApp(const FProMobileApp());
}

class FProMobileApp extends StatelessWidget {
  const FProMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => QuoteProvider()),
        ChangeNotifierProvider(create: (_) => UserProfileProvider()),
        ChangeNotifierProvider(create: (_) => AdminProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AgentProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        // [Changement] Ajout de TechnicienProvider pour permettre la gestion d'état centralisée des interventions.
        ChangeNotifierProvider(create: (_) => TechnicienProvider()),
        ChangeNotifierProvider(create: (_) => MaintenanceProvider()),
      ],
      child: MaterialApp(
        title: 'F-PRO CONSULTING',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2E3F8F),
            primary: const Color(0xFF2E3F8F),
          ),
          useMaterial3: true,
          fontFamily: 'Roboto',
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
