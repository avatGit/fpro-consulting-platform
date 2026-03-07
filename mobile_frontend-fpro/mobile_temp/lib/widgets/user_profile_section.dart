import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_profile_provider.dart';
import '../screens/admin_profile_screen.dart';
import '../screens/agent_profile_screen.dart';
import '../screens/technician_profile_screen.dart';
import 'client_profile_widget.dart';

class UserProfileSection extends StatelessWidget {
  const UserProfileSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<UserProfileProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.profile.id.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final role = provider.profile.role.toLowerCase();

        if (role == 'admin') {
          return const AdminProfileScreen();
        } else if (role == 'agent') {
          return const AgentProfileScreen();
        } else if (role == 'technicien' || role == 'technician') {
          return const TechnicianProfileScreen();
        } else if (role == 'client') {
          return const ClientProfileWidget();
        } else {
          // Default profile view for unknown roles
          return const Center(child: Text('Rôle non reconnu'));
        }
      },
    );
  }
}
