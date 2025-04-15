const bcrypt = require('bcryptjs');
const User = require('../models/User');

class UserService {
  /**
   * Get users with pagination and search
   */
  async getUsers({ page = 1, limit = 10, search = '' }) {
    const query = User.query();
    
    // Apply search if provided
    if (search) {
      query.where(function() {
        this.where('email', 'like', `%${search}%`)
            .orWhere('name', 'like', `%${search}%`)
            .orWhere('first_name', 'like', `%${search}%`)
            .orWhere('last_name', 'like', `%${search}%`);
      });
    }

    // Get total count for pagination
    const total = await query.clone().count('id as total').first();
    
    // Get paginated results
    const users = await query
      .select(['id', 'email', 'name', 'first_name', 'last_name', 'avatar', 'created_at', 'updated_at'])
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy('created_at', 'desc');

    return {
      users,
      pagination: {
        total: total.total,
        page,
        limit,
        total_pages: Math.ceil(total.total / limit)
      }
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return this._getUserData(user);
  }

  /**
   * Create new user
   */
  async createUser(userData, avatarPath = null) {
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

    return this._getUserData(user);
  }

  /**
   * Update user
   */
  async updateUser(id, userData, avatarPath = null) {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Update user data
    const updateData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      name: `${userData.first_name} ${userData.last_name}`.trim()
    };

    if (avatarPath) {
      updateData.avatar = avatarPath;
    }

    const updatedUser = await User.update(id, updateData);
    return this._getUserData(updatedUser);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    await User.delete(id);
  }

  /**
   * Change user password
   */
  async changePassword(id, { current_password, new_password }) {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Verify current password
    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await User.update(id, {
      password: hashedPassword
    });
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

module.exports = new UserService(); 