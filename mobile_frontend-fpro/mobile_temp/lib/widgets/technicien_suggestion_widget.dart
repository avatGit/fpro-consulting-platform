import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/agent_provider.dart';
import 'technicien_details_dialog.dart';

class TechnicienSuggestionWidget extends StatefulWidget {
  final String requestId;

  const TechnicienSuggestionWidget({super.key, required this.requestId});

  @override
  State<TechnicienSuggestionWidget> createState() =>
      _TechnicienSuggestionWidgetState();
}

class _TechnicienSuggestionWidgetState
    extends State<TechnicienSuggestionWidget> {
  List<dynamic> _suggestions = [];
  bool _isSearching = false;

  void _getSuggestions() async {
    setState(() => _isSearching = true);
    try {
      final suggestions = await context.read<AgentProvider>().getSuggestions(
        widget.requestId,
      );
      setState(() => _suggestions = suggestions);
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally {
      setState(() => _isSearching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ElevatedButton.icon(
          onPressed: _isSearching ? null : _getSuggestions,
          icon: const Icon(Icons.auto_awesome),
          label: const Text('SUGGÉRER TECHNICIENS (AI)'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.purple,
            foregroundColor: Colors.white,
          ),
        ),
        if (_isSearching)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(child: CircularProgressIndicator()),
          ),
        if (_suggestions.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text(
            'Suggestions classées par pertinence :',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          ..._suggestions.map(
            (s) => Card(
              child: ListTile(
                title: Text(s['name']),
                subtitle: Text(
                  'Score: ${s['score']}/100 • ${s['recommendation']}',
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextButton(
                      onPressed: () => _showTechDetails(s['user_id']),
                      child: const Text('DÉTAILS'),
                    ),
                    ElevatedButton(
                      onPressed: () => _assign(s['user_id']),
                      child: const Text('ASSIGNER'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
        const SizedBox(height: 16),
        const Text(
          'Ou assignation manuelle :',
          style: TextStyle(color: Colors.grey),
        ),
        _buildManualSelection(),
      ],
    );
  }

  Widget _buildManualSelection() {
    final techniciens = context.watch<AgentProvider>().techniciens;
    return DropdownButtonFormField<String>(
      decoration: const InputDecoration(hintText: 'Choisir un technicien'),
      items: techniciens
          .map((t) => DropdownMenuItem(value: t.id, child: Text(t.name)))
          .toList(),
      onChanged: (value) {
        if (value != null) _assign(value);
      },
    );
  }

  void _showTechDetails(String userId) {
    showDialog(
      context: context,
      builder: (context) => TechnicienDetailsDialog(userId: userId),
    );
  }

  void _assign(String technicianId) async {
    final provider = context.read<AgentProvider>();
    await provider.assignTechnicien(widget.requestId, technicianId);

    if (mounted) {
      if (provider.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${provider.error}'),
            backgroundColor: Colors.red,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Technicien assigné avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }
}
