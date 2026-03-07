import 'package:flutter/material.dart';
import '../../../core/constants/api_constants.dart';
import '../services/auth_service.dart';
import '../../../core/network/api_exception.dart';

/// Page de test pour vérifier la connexion au backend
/// Cette page permet de tester rapidement les endpoints d'authentification
class ConnectionTestPage extends StatefulWidget {
  const ConnectionTestPage({Key? key}) : super(key: key);

  @override
  State<ConnectionTestPage> createState() => _ConnectionTestPageState();
}

class _ConnectionTestPageState extends State<ConnectionTestPage> {
  final _authService = AuthService();
  final List<TestResult> _results = [];
  bool _isRunning = false;

  // Données de test
  final String testEmail =
      'test${DateTime.now().millisecondsSinceEpoch}@test.com';
  final String testPassword = 'Test123456!';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test de Connexion'),
        backgroundColor: Colors.blue,
      ),
      body: Column(
        children: [
          // En-tête avec informations
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '🧪 Test de Connexion Backend',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'URL: ${ApiConstants.baseUrl}',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                ),
                const SizedBox(height: 4),
                Text(
                  'Email de test: $testEmail',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),

          // Bouton de test
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isRunning ? null : _runAllTests,
                icon: _isRunning
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.play_arrow),
                label: Text(
                  _isRunning ? 'Tests en cours...' : 'Lancer les tests',
                ),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ),

          // Résultats
          Expanded(
            child: _results.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.science_outlined,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Cliquez sur "Lancer les tests" pour commencer',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _results.length,
                    itemBuilder: (context, index) {
                      final result = _results[index];
                      return _buildTestResultCard(result);
                    },
                  ),
          ),

          // Résumé en bas
          if (_results.isNotEmpty && !_isRunning)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _allTestsPassed
                    ? Colors.green.shade50
                    : Colors.red.shade50,
                border: Border(
                  top: BorderSide(
                    color: _allTestsPassed ? Colors.green : Colors.red,
                    width: 2,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _allTestsPassed ? Icons.check_circle : Icons.error,
                    color: _allTestsPassed ? Colors.green : Colors.red,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _allTestsPassed
                        ? '✅ Tous les tests sont passés !'
                        : '❌ Certains tests ont échoué',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _allTestsPassed
                          ? Colors.green.shade700
                          : Colors.red.shade700,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTestResultCard(TestResult result) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  result.passed ? Icons.check_circle : Icons.error,
                  color: result.passed ? Colors.green : Colors.red,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    result.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (result.isRunning)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            if (result.message != null) ...[
              const SizedBox(height: 8),
              Text(
                result.message!,
                style: TextStyle(
                  fontSize: 14,
                  color: result.passed
                      ? Colors.green.shade700
                      : Colors.red.shade700,
                ),
              ),
            ],
            if (result.details != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  result.details!,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade700,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  bool get _allTestsPassed => _results.every((r) => r.passed);

  Future<void> _runAllTests() async {
    setState(() {
      _results.clear();
      _isRunning = true;
    });

    // Test 1: Connexion au serveur
    await _testServerConnection();

    // Test 2: Inscription (si le serveur est accessible)
    if (_results.last.passed) {
      await _testRegister();
    }

    // Test 3: Connexion (si l'inscription a réussi)
    if (_results.last.passed) {
      await _testLogin();
    }

    // Test 4: Récupération du profil (si la connexion a réussi)
    if (_results.last.passed) {
      await _testGetProfile();
    }

    // Test 5: Mauvais identifiants
    await _testWrongCredentials();

    setState(() {
      _isRunning = false;
    });
  }

  Future<void> _testServerConnection() async {
    final result = TestResult(name: '🌐 Connexion au serveur', isRunning: true);
    setState(() => _results.add(result));

    try {
      // Essayer de se connecter avec de mauvais identifiants pour tester la connexion
      await _authService.login('test@test.com', 'test');

      // Si on arrive ici sans erreur de connexion, le serveur est accessible
      result.passed = true;
      result.message = 'Serveur accessible sur ${ApiConstants.baseUrl}';
    } on NetworkException catch (e) {
      result.passed = false;
      result.message = 'Impossible de se connecter au serveur';
      result.details = e.message;
    } on ApiException catch (e) {
      // Une erreur API signifie que le serveur a répondu
      result.passed = true;
      result.message = 'Serveur accessible sur ${ApiConstants.baseUrl}';
      result.details = 'Le serveur a répondu avec: ${e.message}';
    } catch (e) {
      result.passed = false;
      result.message = 'Erreur inattendue';
      result.details = e.toString();
    }

    result.isRunning = false;
    setState(() {});
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> _testRegister() async {
    final result = TestResult(name: '📝 Inscription', isRunning: true);
    setState(() => _results.add(result));

    try {
      // Note: L'inscription nécessite des données complètes
      // Pour ce test, on suppose qu'il y a une méthode register dans AuthService
      // Si elle n'existe pas, ce test échouera

      result.passed = false;
      result.message = 'Test d\'inscription non implémenté';
      result.details = 'Utilisez la page d\'inscription normale pour tester';
    } catch (e) {
      result.passed = false;
      result.message = 'Erreur lors de l\'inscription';
      result.details = e.toString();
    }

    result.isRunning = false;
    setState(() {});
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> _testLogin() async {
    final result = TestResult(name: '🔐 Connexion', isRunning: true);
    setState(() => _results.add(result));

    try {
      // Utiliser un compte de test existant
      // Vous devez créer ce compte manuellement d'abord
      final response = await _authService.login(
        'user@test.com', // Changez avec un compte de test valide
        'Test123456!',
      );

      result.passed = true;
      result.message = 'Connexion réussie';
      result.details =
          'User: ${response.user.email}, Role: ${response.user.role}';
    } on UnauthorizedException catch (e) {
      result.passed = false;
      result.message = 'Identifiants invalides';
      result.details =
          'Créez d\'abord un compte de test avec:\nEmail: user@test.com\nPassword: Test123456!';
    } on ApiException catch (e) {
      result.passed = false;
      result.message = 'Erreur API';
      result.details = e.message;
    } catch (e) {
      result.passed = false;
      result.message = 'Erreur inattendue';
      result.details = e.toString();
    }

    result.isRunning = false;
    setState(() {});
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> _testGetProfile() async {
    final result = TestResult(
      name: '👤 Récupération du profil',
      isRunning: true,
    );
    setState(() => _results.add(result));

    try {
      final user = await _authService.getProfile();

      result.passed = true;
      result.message = 'Profil récupéré avec succès';
      result.details =
          'Nom: ${user.firstName} ${user.lastName}\nEmail: ${user.email}';
    } on UnauthorizedException catch (e) {
      result.passed = false;
      result.message = 'Non autorisé';
      result.details = 'Vous devez être connecté pour récupérer le profil';
    } on ApiException catch (e) {
      result.passed = false;
      result.message = 'Erreur API';
      result.details = e.message;
    } catch (e) {
      result.passed = false;
      result.message = 'Erreur inattendue';
      result.details = e.toString();
    }

    result.isRunning = false;
    setState(() {});
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> _testWrongCredentials() async {
    final result = TestResult(name: '🚫 Mauvais identifiants', isRunning: true);
    setState(() => _results.add(result));

    try {
      await _authService.login('wrong@email.com', 'wrongpassword');

      result.passed = false;
      result.message = 'Échec: La connexion aurait dû échouer';
    } on UnauthorizedException catch (e) {
      result.passed = true;
      result.message = 'Erreur 401 correctement retournée';
      result.details = e.message;
    } on ApiException catch (e) {
      result.passed = false;
      result.message = 'Erreur API inattendue';
      result.details = e.message;
    } catch (e) {
      result.passed = false;
      result.message = 'Erreur inattendue';
      result.details = e.toString();
    }

    result.isRunning = false;
    setState(() {});
    await Future.delayed(const Duration(milliseconds: 500));
  }
}

class TestResult {
  final String name;
  bool passed;
  bool isRunning;
  String? message;
  String? details;

  TestResult({
    required this.name,
    this.passed = false,
    this.isRunning = false,
    this.message,
    this.details,
  });
}
