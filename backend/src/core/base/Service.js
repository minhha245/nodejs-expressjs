class Service {
  constructor() {
    if (this.constructor === Service) {
      throw new Error('Abstract class "Service" cannot be instantiated directly');
    }
  }

  // Common service methods
  async findById(id) {
    try {
      return await this.model.query().findById(id);
    } catch (error) {
      throw new Error(`Error finding ${this.constructor.name} by id: ${error.message}`);
    }
  }

  async findOne(conditions) {
    try {
      return await this.model.query().where(conditions).first();
    } catch (error) {
      throw new Error(`Error finding ${this.constructor.name}: ${error.message}`);
    }
  }

  async findAll(conditions = {}) {
    try {
      return await this.model.query().where(conditions);
    } catch (error) {
      throw new Error(`Error finding all ${this.constructor.name}s: ${error.message}`);
    }
  }

  async create(data) {
    try {
      return await this.model.query().insert(data);
    } catch (error) {
      throw new Error(`Error creating ${this.constructor.name}: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      return await this.model.query().patchAndFetchById(id, data);
    } catch (error) {
      throw new Error(`Error updating ${this.constructor.name}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await this.model.query().deleteById(id);
    } catch (error) {
      throw new Error(`Error deleting ${this.constructor.name}: ${error.message}`);
    }
  }
}

module.exports = Service; 