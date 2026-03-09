import 'package:flutter/material.dart';
import '../models/order.dart';
import '../models/product.dart';
import '../models/maintenance_request.dart';
import '../models/user_profile.dart';
import '../services/agent_service.dart';
import '../services/product_service.dart';
import '../services/profile_service.dart';

class AgentProvider extends ChangeNotifier {
  final AgentService _agentService = AgentService();
  final ProfileService _profileService = ProfileService();

  UserProfile? _profile;

  List<Order> _orders = [];
  List<Product> _products = [];
  final ProductService _productService = ProductService();
  List<MaintenanceRequest> _maintenanceRequests = [];
  List<UserProfile> _techniciens = [];
  bool _isLoading = false;
  String? _error;

  List<Order> get orders => _orders;
  List<Product> get products => _products;
  List<MaintenanceRequest> get maintenanceRequests => _maintenanceRequests;
  List<UserProfile> get techniciens => _techniciens;
  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchAllData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _agentService.fetchClientOrders(),
        _agentService.fetchProducts(),
        _agentService.fetchMaintenanceRequests(),
        _agentService.fetchTechniciens(),
      ]);

      _orders = results[0] as List<Order>;
      _products = results[1] as List<Product>;
      _maintenanceRequests = results[2] as List<MaintenanceRequest>;
      _techniciens = results[3] as List<UserProfile>;

      // Fetch profile as part of all data if not already fetched
      if (_profile == null) {
        await fetchProfile();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchOrders() async {
    try {
      _orders = await _agentService.fetchClientOrders();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> validateOrder(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _agentService.validateOrder(id);
      await fetchOrders();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refuseOrder(String id, String message) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _agentService.refuseOrder(id, message);
      await fetchOrders();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMaintenance() async {
    try {
      _maintenanceRequests = await _agentService.fetchMaintenanceRequests();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<List<dynamic>> getSuggestions(String requestId) async {
    return await _agentService.getSuggestedTechniciens(requestId);
  }

  Future<void> assignTechnicien(String requestId, String technicianId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final success = await _agentService.assignTechnicien(
        requestId,
        technicianId,
      );
      if (!success) {
        _error = 'Échec de l\'assignation backend (Status 400 ou autre)';
      } else {
        await fetchMaintenance();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addProduct(Product product) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final newProduct = await _agentService.createProduct(product);
      _products.add(newProduct);
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProduct(Product product) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final updatedProduct = await _agentService.updateProduct(product);
      final index = _products.indexWhere((p) => p.id == product.id);
      if (index != -1) {
        _products[index] = updatedProduct;
      }
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Product CRUD handled if needed, for now we list them.
  Future<void> deleteProduct(String productId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final success = await _agentService.deleteProduct(productId);

      if (success) {
        _products.removeWhere((p) => p.id == productId);
        print('DEBUG: AgentProvider: Produit $productId supprimé avec succès');
      } else {
        _error = 'Échec de la suppression';
        print(
          'DEBUG: AgentProvider: Échec de la suppression du produit $productId',
        );
      }
    } catch (e) {
      print('DEBUG: AgentProvider: Erreur dans deleteProduct: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // [Changement] Marquer comme livrée
  Future<void> markAsDelivered(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _agentService.markAsDelivered(id);
      await fetchOrders();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Profile Management
  Future<void> fetchProfile() async {
    try {
      final response = await _profileService.getMyProfile();
      if (response.statusCode == 200 && response.data['success'] == true) {
        _profile = UserProfile.fromJson(response.data['data']);
        notifyListeners();
      }
    } catch (e) {
      print('AgentProvider: fetchProfile error: $e');
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _profileService.updateMyProfile(data);
      if (response.statusCode == 200 && response.data['success'] == true) {
        _profile = UserProfile.fromJson(response.data['data']);
        return true;
      }
      _error = response.data['message'] ?? 'Erreur lors de la mise à jour';
      return false;
    } catch (e) {
      _error = 'Erreur de connexion';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
