const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidator = require('../validators/userValidator');
const auth = require('../middleware/auth');
const uploadProvider = require('../providers/uploadProvider');

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination)
 * @access  Private/Admin
 */
router.get('/', auth, userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', auth, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user (Admin only)
 * @access  Private/Admin
 */
router.post('/', 
  auth, 
  uploadProvider.single('avatar'),
  userValidator.validateUpdate,
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put('/:id',
  auth,
  uploadProvider.single('avatar'),
  userValidator.validateUpdate,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', auth, userController.deleteUser);

/**
 * @route   PUT /api/users/:id/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/:id/change-password',
  auth,
  userValidator.validateChangePassword,
  userController.changePassword
);

module.exports = router; 