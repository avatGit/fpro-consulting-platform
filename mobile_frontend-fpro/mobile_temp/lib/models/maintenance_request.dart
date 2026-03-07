enum MaintenanceStatus {
  pending,
  assigned,
  inProgress,
  completedByTechnician,
  closed,
  cancelled,
}

class MaintenanceRequest {
  final String id;
  final String equipmentType;
  final String description;
  final String urgency;
  final MaintenanceStatus status;
  final String? technicienName;
  final String? technicianId;
  final DateTime date;
  final String clientName;

  MaintenanceRequest({
    required this.id,
    required this.equipmentType,
    required this.description,
    required this.urgency,
    this.status = MaintenanceStatus.pending,
    this.technicienName,
    this.technicianId,
    required this.date,
    required this.clientName,
  });

  MaintenanceRequest copyWith({
    String? id,
    String? equipmentType,
    String? description,
    String? urgency,
    MaintenanceStatus? status,
    String? technicienName,
    String? technicianId,
    DateTime? date,
    String? clientName,
  }) {
    return MaintenanceRequest(
      id: id ?? this.id,
      equipmentType: equipmentType ?? this.equipmentType,
      description: description ?? this.description,
      urgency: urgency ?? this.urgency,
      status: status ?? this.status,
      technicienName: technicienName ?? this.technicienName,
      technicianId: technicianId ?? this.technicianId,
      date: date ?? this.date,
      clientName: clientName ?? this.clientName,
    );
  }

  String get statusLabel {
    switch (status) {
      case MaintenanceStatus.pending:
        return 'En attente';
      case MaintenanceStatus.assigned:
        return 'Technicien assigné';
      case MaintenanceStatus.inProgress:
        return 'En cours';
      case MaintenanceStatus.completedByTechnician:
        return 'Terminé - En attente confirmation';
      case MaintenanceStatus.closed:
        return 'Clôturé';
      case MaintenanceStatus.cancelled:
        return 'Annulé';
    }
  }

  factory MaintenanceRequest.fromJson(Map<String, dynamic> json) {
    // Determine client name from nested user object if it exists
    String clientName = 'Client inconnu';
    if (json['user'] != null) {
      clientName = '${json['user']['first_name']} ${json['user']['last_name']}';
    } else if (json['client_name'] != null) {
      clientName = json['client_name'];
    }

    // Safe date parsing
    DateTime createdAt = DateTime.now();
    try {
      if (json['created_at'] != null) {
        createdAt = DateTime.parse(json['created_at']);
      }
    } catch (e) {
      print('Error parsing maintenance date: $e');
    }

    print(
      '📦 Maintenance reçue - ID: ${json['id']}, Status brut: ${json['status']}',
    );
    print('   → Mappé vers: ${_parseStatus(json['status'])}');

    return MaintenanceRequest(
      id: json['id'] ?? '',
      equipmentType: json['request_type'] ?? 'N/A',
      description: json['description'] ?? '',
      urgency: json['priority'] ?? 'medium',
      status: _parseStatus(json['status']),
      technicienName: json['technician'] != null
          ? '${json['technician']['first_name']} ${json['technician']['last_name']}'
          : null,
      technicianId:
          json['technician_id']?.toString() ??
          json['technician']?['id']?.toString(),
      date: createdAt,
      clientName: clientName,
    );
  }

  static MaintenanceStatus _parseStatus(String? status) {
    switch (status) {
      case 'pending':
      case 'new': // Backward compatibility
        return MaintenanceStatus.pending;
      case 'assigned':
        return MaintenanceStatus.assigned;
      case 'in_progress':
        return MaintenanceStatus.inProgress;
      case 'completed_by_technician':
      case 'Terminé': // Optional flexibility for potential localization
      case 'terminé':
      case 'Terminé - En attente confirmation': // Explicitly handle the displayed label if leaked to data
      case 'terminé - en attente de confirmation':
        return MaintenanceStatus.completedByTechnician;
      case 'closed':
      case 'Clôturé':
        return MaintenanceStatus.closed;
      case 'cancelled':
      case 'Annulé':
        return MaintenanceStatus.cancelled;
      default:
        return MaintenanceStatus.pending;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'description': description,
      'priority': urgency,
      'request_type': equipmentType,
    };
  }
}
