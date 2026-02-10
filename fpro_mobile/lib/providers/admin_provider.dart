import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/maintenance_request.dart';
import '../models/rental_item.dart';
import '../models/user_profile.dart';

class AdminProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  bool get isLoggedIn => _isLoggedIn;

  final List<Product> _products = [
    Product(
      id: 'p1',
      name: 'Papier A4 80g',
      description: 'Rame de 500 feuilles haute qualité',
      price: 3500,
      stock: 50,
      imageUrl: '',
      category: 'Papier',
    ),
    Product(
      id: 'p2',
      name: 'Cartouche HP 305',
      description: 'Encre noire originale HP',
      price: 12500,
      stock: 12,
      imageUrl: '',
      category: 'Encres',
    ),
    Product(
      id: 'p3',
      name: 'Souris Optique Sans Fil',
      description: 'Souris ergonomique avec récepteur USB',
      price: 8500,
      stock: 25,
      imageUrl: '',
      category: 'Accessoires',
    ),
    Product(
        id: 'p4',
        name: 'Imprimante LaserJet Pro',
        description: 'Imprimante laser monochrome rapide',
        price: 156000,
        stock: 5,
        imageUrl: '',
        category: 'Matériel',
    ),
  ];

  final List<RentalItem> _rentalItems = [
    RentalItem(
      id: 'r1',
      name: 'Imprimante Pro Multi',
      description: 'Grande imprimante de bureau pour événements',
      pricePerDay: 5000,
      imageUrl: '',
      available: true,
    ),
    RentalItem(
      id: 'r2',
      name: 'Serveur NAS 4 Baies',
      description: 'Solution de stockage réseau haute performance',
      pricePerDay: 15000,
      imageUrl: '',
      available: true,
    ),
  ];

  final List<MaintenanceRequest> _maintenanceRequests = [
    MaintenanceRequest(
      id: 'm1',
      equipmentType: 'Imprimante Laser',
      description: 'Bourrage papier constant et bruit anormal',
      urgency: 'Haute',
      status: MaintenanceStatus.enCours,
      technicianName: 'Moussa Diop',
      date: DateTime.now().subtract(const Duration(days: 1)),
      clientName: 'SENELEC',
    ),
  ];

  List<Product> get products => List.unmodifiable(_products);
  List<RentalItem> get rentalItems => List.unmodifiable(_rentalItems);
  List<MaintenanceRequest> get maintenanceRequests => List.unmodifiable(_maintenanceRequests);

  final List<UserProfile> _agents = [
    UserProfile(
      id: 'a1',
      name: 'Agent Fatou',
      role: 'agent',
      email: 'agent@fpro.com',
      company: 'F-PRO',
      phone: '771234567',
      memberSince: DateTime.now(),
    ),
  ];

  final List<UserProfile> _technicians = [
    UserProfile(
      id: 't1',
      name: 'Moussa Diop',
      role: 'technician',
      email: 'moussa@fpro.com',
      company: 'F-PRO',
      phone: '779876543',
      memberSince: DateTime.now(),
    ),
  ];

  List<UserProfile> get agents => List.unmodifiable(_agents);
  List<UserProfile> get technicians => List.unmodifiable(_technicians);

  // Auth
  String? _currentRole;
  String? get currentRole => _currentRole;

  bool login(String username, String password) {
    if (username == 'admin' && password == 'admin123') {
      _isLoggedIn = true;
      _currentRole = 'admin';
      notifyListeners();
      return true;
    }
    
    // Check Agents
    for (var agent in _agents) {
      if (username == agent.email && password == 'agent123') {
        _isLoggedIn = true;
        _currentRole = 'agent';
        notifyListeners();
        return true;
      }
    }

    // Check Technicians
    for (var tech in _technicians) {
      if (username == tech.email && password == 'tech123') {
        _isLoggedIn = true;
        _currentRole = 'technician';
        notifyListeners();
        return true;
      }
    }
    
    return false;
  }

  void logout() {
    _isLoggedIn = false;
    _currentRole = null;
    notifyListeners();
  }

  // User Management
  void addAgent(UserProfile user) {
    _agents.add(user);
    notifyListeners();
  }

  void updateAgent(UserProfile user) {
    final index = _agents.indexWhere((u) => u.id == user.id);
    if (index >= 0) {
      _agents[index] = user;
      notifyListeners();
    }
  }

  void deleteAgent(String id) {
    _agents.removeWhere((u) => u.id == id);
    notifyListeners();
  }

  void addTechnician(UserProfile user) {
    _technicians.add(user);
    notifyListeners();
  }

  void updateTechnician(UserProfile user) {
    final index = _technicians.indexWhere((u) => u.id == user.id);
    if (index >= 0) {
      _technicians[index] = user;
      notifyListeners();
    }
  }

  void deleteTechnician(String id) {
    _technicians.removeWhere((u) => u.id == id);
    notifyListeners();
  }

  // Product CRUD
  void addProduct(Product product) {
    _products.add(product);
    notifyListeners();
  }

  void updateProduct(Product product) {
    final index = _products.indexWhere((p) => p.id == product.id);
    if (index >= 0) {
      _products[index] = product;
      notifyListeners();
    }
  }

  void deleteProduct(String id) {
    _products.removeWhere((p) => p.id == id);
    notifyListeners();
  }

  // Rental CRUD
  void addRental(RentalItem item) {
    _rentalItems.add(item);
    notifyListeners();
  }

  void updateRental(RentalItem item) {
    final index = _rentalItems.indexWhere((r) => r.id == item.id);
    if (index >= 0) {
      _rentalItems[index] = item;
      notifyListeners();
    }
  }

  void deleteRental(String id) {
    _rentalItems.removeWhere((r) => r.id == id);
    notifyListeners();
  }

  // Maintenance Management
  void updateMaintenanceStatus(String id, MaintenanceStatus status, {String? technicianName}) {
    final index = _maintenanceRequests.indexWhere((m) => m.id == id);
    if (index >= 0) {
      _maintenanceRequests[index] = _maintenanceRequests[index].copyWith(
        status: status,
        technicianName: technicianName,
      );
      notifyListeners();
    }
  }

  // Stats for Admin Dashboard
  int get pendingOrdersCount => 2; // Mock for now, linked to CartProvider later
  int get pendingMaintenanceCount => 
      _maintenanceRequests.where((m) => m.status == MaintenanceStatus.enAttente).length;
  int get activeMaintenanceCount => 
      _maintenanceRequests.where((m) => m.status == MaintenanceStatus.enCours).length;
  int get totalStockItems => 
      _products.fold(0, (sum, p) => sum + p.stock);
}
