enum NotificationStatus { pending, sent, failed, read }

class NotificationModel {
  final int id;
  final String type;
  final String channel;
  final String subject;
  final String message;
  final Map<String, dynamic> data;
  final NotificationStatus status;
  final DateTime sentAt;

  NotificationModel({
    required this.id,
    required this.type,
    required this.channel,
    required this.subject,
    required this.message,
    required this.data,
    required this.status,
    required this.sentAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      type: json['type'] ?? 'general',
      channel: json['channel'] ?? 'in_app',
      subject: json['subject'] ?? '',
      message: json['message'] ?? '',
      data: json['data'] ?? {},
      status: _parseStatus(json['status']),
      sentAt: DateTime.parse(
        json['sent_at'] ??
            json['created_at'] ??
            DateTime.now().toIso8601String(),
      ),
    );
  }

  static NotificationStatus _parseStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'read':
        return NotificationStatus.read;
      case 'failed':
        return NotificationStatus.failed;
      case 'sent':
        return NotificationStatus.sent;
      default:
        return NotificationStatus.pending;
    }
  }

  bool get isRead => status == NotificationStatus.read;
}
