const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validators/authValidators');

// POST /api/auth/register
router.post('/register', 
  validate(registerSchema), 
  authController.register
);

// POST /api/auth/login
router.post('/login', 
  validate(loginSchema), 
  authController.login
);

// POST /api/auth/refresh-token
router.post('/refresh-token', 
  authController.refreshToken
);

// GET /api/auth/profile
router.get('/profile', 
  authenticate, 
  authController.getProfile
);

// PUT /api/auth/profile
router.put('/profile', 
  authenticate, 
  validate(updateProfileSchema), 
  authController.updateProfile
);

// POST /api/auth/change-password
router.post('/change-password', 
  authenticate, 
  validate(changePasswordSchema), 
  authController.changePassword
);

// POST /api/auth/logout
router.post('/logout', 
  authenticate, 
  authController.logout
);

module.exports = router;