const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userService = require('../services/userService');

class UserController {
  /**
   * Get all users with pagination
   */
  async getUsers(req, res) {
    try {
      const result = await userService.getUsers({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || ''
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }

  /**
   * Create new user (Admin only)
   */
  async createUser(req, res) {
    try {
      // Check permission
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      const user = await userService.createUser(
        req.body,
        req.file ? req.file.path : null
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      // Check permission
      const user = await userService.getUserById(req.params.id);
      if (req.user.id !== user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      const updatedUser = await userService.updateUser(
        req.params.id,
        req.body,
        req.file ? req.file.path : null
      );

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      // Check permission
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      await userService.deleteUser(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res) {
    try {
      // Check permission
      const user = await userService.getUserById(req.params.id);
      if (req.user.id !== user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      await userService.changePassword(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'An error occurred'
      });
    }
  }
}

module.exports = new UserController(); 