const QueryBuilder = require('../database/QueryBuilder');

class Model {
  constructor() {
    if (this.constructor === Model) {
      throw new Error('Model class cannot be instantiated directly');
    }
  }

  static get tableName() {
    throw new Error('tableName must be implemented by child class');
  }

  static query() {
    return new QueryBuilder(this.tableName);
  }

  static async findById(id) {
    return await this.query().where('id', '=', id).first();
  }

  static async findAll() {
    return await this.query().get();
  }

  static async create(data) {
    return await this.query().insert(data);
  }

  static async update(id, data) {
    return await this.query().where('id', '=', id).update(data);
  }

  static async delete(id) {
    return await this.query().where('id', '=', id).delete();
  }
}

module.exports = Model; 