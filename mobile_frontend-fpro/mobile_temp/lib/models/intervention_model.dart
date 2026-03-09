import 'maintenance_request.dart';

enum InterventionStatus { scheduled, inProgress, completed, failed, cancelled }

// [Changement] Création du modèle Intervention pour mapper les données reçues du nouvel endpoint backend /api/interventions/my.
// Ce modèle permet une manipulation structurée des interventions et de leurs états associés dans l'application Flutter.
class Intervention {
  final String id;
  final String requestId;
  final InterventionStatus status;
  final DateTime? scheduledAt;
  final DateTime? startedAt;
  final DateTime? finishedAt;
  final MaintenanceRequest? request;

  Intervention({
    required this.id,
    required this.requestId,
    required this.status,
    this.scheduledAt,
    this.startedAt,
    this.finishedAt,
    this.request,
  });

  factory Intervention.fromJson(Map<String, dynamic> json) {
    return Intervention(
      id: json['id'],
      requestId: json['request_id'],
      status: _parseStatus(json['status']),
      scheduledAt: json['scheduled_at'] != null
          ? DateTime.parse(json['scheduled_at'])
          : null,
      startedAt: json['started_at'] != null
          ? DateTime.parse(json['started_at'])
          : null,
      finishedAt: json['finished_at'] != null
          ? DateTime.parse(json['finished_at'])
          : null,
      request: json['request'] != null
          ? MaintenanceRequest.fromJson(json['request'])
          : null,
    );
  }

  static InterventionStatus _parseStatus(String status) {
    switch (status) {
      case 'scheduled':
        return InterventionStatus.scheduled;
      case 'in_progress':
        return InterventionStatus.inProgress;
      case 'completed':
        return InterventionStatus.completed;
      case 'failed':
        return InterventionStatus.failed;
      case 'cancelled':
        return InterventionStatus.cancelled;
      default:
        return InterventionStatus.scheduled;
    }
  }

  String get statusDisplay {
    switch (status) {
      case InterventionStatus.scheduled:
        return 'Programmée';
      case InterventionStatus.inProgress:
        return 'En cours';
      case InterventionStatus.completed:
        return 'Terminée';
      case InterventionStatus.failed:
        return 'Échouée';
      case InterventionStatus.cancelled:
        return 'Annulée';
    }
  }
}
