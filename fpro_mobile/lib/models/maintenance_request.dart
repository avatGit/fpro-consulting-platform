enum MaintenanceStatus {
  enAttente,
  enCours,
  termine,
  annule
}

class MaintenanceRequest {
  final String id;
  final String equipmentType;
  final String description;
  final String urgency;
  final MaintenanceStatus status;
  final String? technicianName;
  final DateTime date;
  final String clientName;

  MaintenanceRequest({
    required this.id,
    required this.equipmentType,
    required this.description,
    required this.urgency,
    this.status = MaintenanceStatus.enAttente,
    this.technicianName,
    required this.date,
    required this.clientName,
  });

  MaintenanceRequest copyWith({
    String? id,
    String? equipmentType,
    String? description,
    String? urgency,
    MaintenanceStatus? status,
    String? technicianName,
    DateTime? date,
    String? clientName,
  }) {
    return MaintenanceRequest(
      id: id ?? this.id,
      equipmentType: equipmentType ?? this.equipmentType,
      description: description ?? this.description,
      urgency: urgency ?? this.urgency,
      status: status ?? this.status,
      technicianName: technicianName ?? this.technicianName,
      date: date ?? this.date,
      clientName: clientName ?? this.clientName,
    );
  }

  String get statusLabel {
    switch (status) {
      case MaintenanceStatus.enAttente: return 'En attente';
      case MaintenanceStatus.enCours: return 'En cours';
      case MaintenanceStatus.termine: return 'Terminé';
      case MaintenanceStatus.annule: return 'Annulé';
    }
  }
}
