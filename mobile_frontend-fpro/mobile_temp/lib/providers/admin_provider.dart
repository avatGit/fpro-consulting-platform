import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/maintenance_request.dart';
import '../models/rental_item.dart';
import '../models/user_profile.dart';
import '../services/admin_service.dart';
import '../features/auth/services/auth_service.dart';
import '../services/product_service.dart';
import '../services/maintenance_service.dart';
import '../services/quote_service.dart';
import '../services/profile_service.dart';
import '../services/review_service.dart';
import '../models/review.dart';

class AdminProvider extends ChangeNotifier {
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  final ProductService _productService = ProductService();
  final ProfileService _profileService = ProfileService();
  final ReviewService _reviewService = ReviewService();
  // final MaintenanceService _maintenanceService = MaintenanceService();

  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _currentRole;
  String? _error;
  UserProfile? _profile;

  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get currentRole => _currentRole;
  String? get error => _error;
  UserProfile? get profile => _profile;

  List<Product> _products = [];
  List<RentalItem> _rentalItems =
      []; // Backend doesn't distinguish well yet, assumes generic products
  List<MaintenanceRequest> _maintenanceRequests = [];
  List<UserProfile> _agents = [];
  List<UserProfile> _techniciens = [];
  List<Review> _reviews = [];

  List<Product> get products => _products;
  List<RentalItem> get rentalItems =>
      _rentalItems; // Might need separate logic or filter
  List<MaintenanceRequest> get maintenanceRequests => _maintenanceRequests;
  List<UserProfile> get agents => _agents;
  List<UserProfile> get techniciens => _techniciens;
  List<Review> get reviews => _reviews;

  // Stats
  int get pendingOrdersCount => 0; // Not implemented on backend for admin
  int get pendingMaintenanceCount => _maintenanceRequests
      .where((m) => m.status == MaintenanceStatus.pending)
      .length;
  int get activeMaintenanceCount => _maintenanceRequests
      .where(
        (m) =>
            m.status == MaintenanceStatus.assigned ||
            m.status == MaintenanceStatus.inProgress,
      )
      .length;
  int get totalStockItems => _products.fold(0, (sum, p) => sum + p.stock);

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _authService.login(email, password);
      // Access token is stored by AuthService
      // Check role - logic depends on what login returns.
      // AuthService usually returns LoginResponse or similar.
      // Let's assume we can get user info.

      final user = await _authService
          .getCurrentUser(); // Or similar method if exists
      if (user != null && (user.role == 'admin' || user.role == 'agent')) {
        _isLoggedIn = true;
        _currentRole = user.role;
        await fetchAllData();
        return true;
      } else {
        _isLoggedIn = false;
        return false;
      }
    } catch (e) {
      print('Login error: $e');
      _isLoggedIn = false;
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void logout() {
    _authService.logout();
    _isLoggedIn = false;
    _currentRole = null;
    notifyListeners();
  }

  Future<void> fetchAllData() async {
    _isLoading = true;
    notifyListeners();
    try {
      await Future.wait([
        fetchStaff(),
        fetchProducts(),
        fetchMaintenance(),
        fetchReviews(),
      ]);
    } catch (e) {
      print('Error fetching admin data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchStaff() async {
    try {
      final allUsers = await _adminService.listUsers(); // Lists all by default
      _agents = allUsers.where((u) => u.role == 'agent').toList();
      _techniciens = allUsers.where((u) => u.role == 'technicien').toList();
      notifyListeners();
    } catch (e) {
      print('Error fetching staff: $e');
    }
  }

  Future<void> fetchProducts() async {
    try {
      final products = await _productService.getAllProducts();
      _products = products;

      // Populate rental items from products as a heuristic (Matériel/Rental type)
      _rentalItems = products
          .where(
            (p) =>
                p.category == 'Matériel' ||
                p.category == 'Matériel Informatique',
          )
          .map(
            (p) => RentalItem(
              id: p.id,
              name: p.name,
              pricePerDay: p.price,
              description: p.description,
              imageUrl: p.imageUrl,
              available: p.stock > 0,
            ),
          )
          .toList();

      notifyListeners();
    } catch (e) {
      print('DEBUG: AdminProvider: Error fetching products: $e');
    }
  }

  Future<void> fetchMaintenance() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _maintenanceRequests = await _adminService.fetchMaintenanceRequests();
    } catch (e) {
      print('DEBUG: AdminProvider: Error fetching maintenance: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchReviews() async {
    try {
      _reviews = await _reviewService.getAllReviews();
      notifyListeners();
    } catch (e) {
      print('DEBUG: AdminProvider: Error fetching reviews: $e');
    }
  }

  // User Management
  Future<void> addAgent(Map<String, dynamic> data) async {
    try {
      await _adminService.createAgent(data);
      await fetchStaff();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> addTechnicien(Map<String, dynamic> data) async {
    try {
      await _adminService.createTechnicien(data);
      await fetchStaff();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateAgent(UserProfile user) async {
    // For now, updating locally or implement specific backend call if exists
    final index = _agents.indexWhere((a) => a.id == user.id);
    if (index != -1) {
      _agents[index] = user;
      notifyListeners();
    }
  }

  Future<void> updateTechnicien(UserProfile user) async {
    final index = _techniciens.indexWhere((t) => t.id == user.id);
    if (index != -1) {
      _techniciens[index] = user;
      notifyListeners();
    }
  }

  Future<void> deleteAgent(String id) async {
    await _adminService.updateUserStatus(
      id,
      false,
    ); // Deactivate instead of delete
    await fetchStaff();
  }

  Future<void> deleteTechnicien(String id) async {
    await _adminService.updateUserStatus(id, false);
    await fetchStaff();
  }

  // Product CRUD
  Future<void> addProduct(Product product) async {
    // In a real app: await _productService.createProduct(product);
    _products.add(product);
    notifyListeners();
  }

  Future<void> updateProduct(Product product) async {
    final index = _products.indexWhere((p) => p.id == product.id);
    if (index != -1) {
      _products[index] = product;
      notifyListeners();
    }
  }

  /*  Future<void> deleteProduct(String id) async {
    _products.removeWhere((p) => p.id == id);
    notifyListeners();
  } */

  Future<void> deleteProduct(String productId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      //final success = await _adminService.deleteProduct(productId);
      final bool success =
          await (_productService.deleteProduct(productId) as Future<bool>);

      if (success) {
        // Mettez à jour la liste des produits après suppression
        await fetchProducts();
        _error = null;
      }

      _products.removeWhere((p) => p.id == productId);
      print('✅ Produit $productId supprimé avec succès');
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Rental CRUD - Linked to Product CRUD
  Future<void> addRental(RentalItem item) async {
    final product = Product(
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.pricePerDay,
      stock: 5, // Default stock for rentals
      imageUrl: item.imageUrl,
      category: 'Matériel',
    );
    await addProduct(product);
  }

  Future<void> updateRental(RentalItem item) async {
    final product = Product(
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.pricePerDay,
      stock: 5,
      imageUrl: item.imageUrl,
      category: 'Matériel',
    );
    await updateProduct(product);
  }

  Future<void> deleteRental(String id) async {
    await deleteProduct(id);
  }

  Future<void> updateMaintenanceStatus(
    String id,
    MaintenanceStatus status, {
    String? technicienName,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Map enum back to backend string status
      String statusStr;
      switch (status) {
        case MaintenanceStatus.pending:
          statusStr = 'pending';
          break;
        case MaintenanceStatus.assigned:
          statusStr = 'assigned';
          break;
        case MaintenanceStatus.inProgress:
          statusStr = 'in_progress';
          break;
        case MaintenanceStatus.completedByTechnician:
          statusStr = 'completed_by_technician';
          break;
        case MaintenanceStatus.closed:
          statusStr = 'closed';
          break;
        case MaintenanceStatus.cancelled:
          statusStr = 'cancelled';
          break;
      }

      await _adminService.updateMaintenanceStatus(id, statusStr);

      final index = _maintenanceRequests.indexWhere((r) => r.id == id);
      if (index != -1) {
        _maintenanceRequests[index] = _maintenanceRequests[index].copyWith(
          status: status,
          technicienName: technicienName,
        );
      }
    } catch (e) {
      print('DEBUG: AdminProvider: Error updating maintenance status: $e');
      _error = e.toString();
      rethrow;
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
      print('AdminProvider: fetchProfile error: $e');
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
