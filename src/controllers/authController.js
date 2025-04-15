const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const authService = require('../services/authService');

class AuthController {
  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ 
        success: false,
        message: error.message || 'Đã có lỗi xảy ra'
      });
    }
  }

  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const result = await authService.register(
        req.body,
        req.file ? req.file.path : null
      );

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message || 'Đã có lỗi xảy ra'
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      await authService.logout(req.user.id);

      res.json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Đã có lỗi xảy ra'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(404).json({ 
        success: false,
        message: error.message || 'Đã có lỗi xảy ra'
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const result = await authService.refreshToken(req.body.refresh_token);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid refresh token'
      });
    }
  }

  /**
   * Generate access token
   */
  _generateAccessToken(user) {
    return jwt.sign(
      { userId: user.id },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiration }
    );
  }

  /**
   * Generate refresh token
   */
  _generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiration }
    );
  }

  /**
   * Get safe user data
   */
  _getUserData(user) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      name: user.name,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}

module.exports = new AuthController(); 