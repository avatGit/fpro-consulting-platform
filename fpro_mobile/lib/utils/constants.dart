import 'package:flutter/material.dart';

// Color Constants
class AppColors {
  static const Color primaryBlue = Color(0xFF2E3F8F);
  static const Color darkBlue = Color(0xFF1E2A5E);
  static const Color lightBlue = Color(0xFF4A5FC1);
  static const Color accentGreen = Color(0xFF28A745);
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color mediumGray = Color(0xFFE0E0E0);
  static const Color darkGray = Color(0xFF666666);
  static const Color textDark = Color(0xFF1A1A1A);
  static const Color textLight = Color(0xFF757575);
  
  // Status colors
  static const Color statusOrange = Color(0xFFFF9800);
  static const Color statusYellow = Color(0xFFFFC107);
  static const Color statusGreen = Color(0xFF4CAF50);
  static const Color statusBlue = Color(0xFF2196F3);
}

// Text Styles
class AppTextStyles {
  static const TextStyle heading1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.white,
  );
  
  static const TextStyle heading2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textDark,
  );
  
  static const TextStyle heading3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textDark,
  );
  
  static const TextStyle bodyText = TextStyle(
    fontSize: 16,
    color: AppColors.textDark,
  );
  
  static const TextStyle bodyTextLight = TextStyle(
    fontSize: 14,
    color: AppColors.textLight,
  );
  
  static const TextStyle buttonText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.white,
  );
}
