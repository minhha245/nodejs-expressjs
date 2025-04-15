const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

class AuthService {
  /**
   * Login with email and password
   */
  async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Generate tokens
    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    // Save refresh token
    await User.update(user.id, {
      refresh_token: refreshToken,
      last_login_at: new Date()
    });

    return {
      user: this._getUserData(user),
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * Register new user
   */
  async register(userData, avatarPath = null) {
    const { email, password, first_name, last_name } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      name: `${first_name} ${last_name}`.trim(),
      avatar: avatarPath
    });

    // Generate tokens
    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    // Save refresh token
    await User.update(user.id, {
      refresh_token: refreshToken,
      last_login_at: new Date()
    });

    return {
      user: this._getUserData(user),
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    await User.update(userId, {
      refresh_token: null
    });
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return this._getUserData(user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || user.refresh_token !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      return {
        access_token: this._generateAccessToken(user)
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
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

module.exports = new AuthService(); 
module.exports = new AuthService(); 