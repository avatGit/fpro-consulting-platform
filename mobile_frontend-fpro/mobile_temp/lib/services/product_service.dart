import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/product.dart';

class ProductService {
  final _apiClient = ApiClient();

  Future<List<Product>> getProducts({String? search}) async {
    try {
      final queryParams = search != null ? {'search': search} : null;
      final response = await _apiClient.get(
        ApiConstants.productsEndpoint,
        queryParameters: queryParams,
      );

      print('ProductService: GET /api/products STATUS: ${response.statusCode}');
      print('ProductService: GET /api/products BODY: ${response.data}');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Product.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('ProductService: Error fetching products: $e');
      rethrow;
    }
  }

  Future<bool> deleteProduct(String productId) async {
    try {
      print(' Tentative de suppression du produit: $productId');

      //final response = await _apiClient.delete('/api/products/$productId');
      final url = '/api/products/$productId';
      print('🔍 URL appelée: $url');
      final response = await _apiClient.delete(url);

      if (response.statusCode == 200 || response.statusCode == 204) {
        print(' Produit supprimé avec succès');
        return true;
      } else {
        print(' Réponse inattendue: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print(' Erreur lors de la suppression du produit: $e');
      return false;
    }
  }

  Future<List<Product>> getAllProducts() async {
    return await getProducts();
  }
}
