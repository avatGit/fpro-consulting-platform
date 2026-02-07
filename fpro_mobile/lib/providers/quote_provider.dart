import 'package:flutter/material.dart';
import '../models/quote.dart';

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
}
