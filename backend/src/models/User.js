const BaseModel = require('./BaseModel');

class User extends BaseModel {
  constructor() {
    super();
    // Không cần định nghĩa attributes và rules ở đây nữa
    // vì đã được tự động load từ attributes.js
  }

  // Custom methods for User model
  async findByEmail(email) {
    return await this.findByField('email', email);
  }

  async verifyEmail(id) {
    return await this.update(id, {
      email_verified_at: new Date()
    });
  }

  // Override create method to hash password
  async create(data) {
    // TODO: Hash password before saving
    return await super.create(data);
  }

  // Override update method to hash password if it's being updated
  async update(id, data) {
    if (data.password) {
      // TODO: Hash password before updating
    }
    return await super.update(id, data);
  }

  static async findWithPosts(userId) {
    return await this.query()
      .select(['users.*', 'posts.title as post_title'])
      .join('posts', 'users.id', '=', 'posts.user_id')
      .where('users.id', '=', userId)
      .get();
  }
}

module.exports = new User(); 