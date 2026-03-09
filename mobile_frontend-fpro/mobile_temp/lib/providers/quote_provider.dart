import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import 'package:universal_html/html.dart' as html;
import '../models/quote.dart';
import '../services/quote_service.dart';

class QuoteProvider with ChangeNotifier {
  final List<Quote> _quotes = [];
  int _quoteCounter = 1;

  List<Quote> get quotes => List.unmodifiable(_quotes);

  List<Quote> getQuotesByStatus(QuoteStatus? status) {
    if (status == null) return quotes;
    return _quotes.where((q) => q.status == status).toList();
  }

  void addQuote(Quote quote) {
    _quotes.insert(0, quote);
    notifyListeners();
  }

  void updateQuoteStatus(String quoteId, QuoteStatus newStatus) {
    final index = _quotes.indexWhere((q) => q.id == quoteId);
    if (index != -1) {
      final oldQuote = _quotes[index];
      _quotes[index] = Quote(
        id: oldQuote.id,
        reference: oldQuote.reference,
        clientName: oldQuote.clientName,
        clientAddress: oldQuote.clientAddress,
        products: oldQuote.products,
        createdDate: oldQuote.createdDate,
        status: newStatus,
      );
      notifyListeners();
    }
  }

  void deleteQuote(String quoteId) {
    _quotes.removeWhere((q) => q.id == quoteId);
    notifyListeners();
  }

  String generateReference() {
    final now = DateTime.now();
    final ref = 'DEV-${now.year}-${_quoteCounter.toString().padLeft(4, '0')}';
    _quoteCounter++;
    return ref;
  }

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  Future<void> fetchQuotes() async {
    _isLoading = true;
    notifyListeners();

    try {
      final service = QuoteService();
      final data = await service.getUserQuotes();

      _quotes.clear();
      _quotes.addAll(data.map((json) => Quote.fromJson(json)).toList());
    } catch (e) {
      print('Error fetching quotes: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Quote createQuote({
    required String clientName,
    required String clientAddress,
    required List<QuoteProduct> products,
  }) {
    final quote = Quote(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      reference: generateReference(),
      clientName: clientName,
      clientAddress: clientAddress,
      products: products,
      createdDate: DateTime.now(),
      status: QuoteStatus.pending,
    );
    addQuote(quote);
    return quote;
  }

  Future<void> downloadPdf(BuildContext context, Quote quote) async {
    try {
      final service = QuoteService();
      final response = await service.downloadQuotePdf(quote.id);

      if (response.statusCode == 200) {
        final bytes = response.data as List<int>;

        if (kIsWeb) {
          final blob = html.Blob([bytes], 'application/pdf');
          final url = html.Url.createObjectUrlFromBlob(blob);
          final anchor = html.AnchorElement(href: url)
            ..setAttribute("download", "devis-${quote.reference}.pdf")
            ..click();
          html.Url.revokeObjectUrl(url);
        } else {
          final tempDir = await getTemporaryDirectory();
          final file = File('${tempDir.path}/devis-${quote.reference}.pdf');
          await file.writeAsBytes(bytes);
          await OpenFilex.open(file.path);
        }
      } else {
        throw Exception('Erreur lors du téléchargement du PDF');
      }
    } catch (e) {
      print('Error downloading PDF: $e');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Échec du téléchargement: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
