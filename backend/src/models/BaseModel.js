const validationMessages = require('../messages/validation');
const modelAttributes = require('./attributes');

class BaseModel {
  constructor() {
    this.table = '';
    this.primaryKey = 'id';
    this.modelName = this.constructor.name.toLowerCase() + 's'; // users, posts, etc.
    this.attributes = {};
    this.rules = {};
    this.errors = [];

    // Tự động load attributes và rules từ file attributes.js
    if (modelAttributes[this.modelName]) {
      this.attributes = modelAttributes[this.modelName].attributes;
      this.rules = modelAttributes[this.modelName].rules;
    }
  }

  validate(data) {
    this.errors = [];
    const validations = this._parseRules(data);
    
    for (const [field, rules] of Object.entries(validations)) {
      const value = data[field];
      
      for (const rule of rules) {
        const [ruleName, ...params] = rule.split(':');
        const ruleParams = params.length ? params[0].split(',') : [];
        
        if (!this._validateRule(ruleName, value, ruleParams, field, data)) {
          this.errors.push({
            field,
            message: this._formatMessage(ruleName, field, ruleParams, data)
          });
        }
      }
    }

    return this.errors.length === 0;
  }

  _parseRules(data) {
    const validations = {};
    
    for (const [field, fieldRules] of Object.entries(this.rules)) {
      if (typeof fieldRules === 'string') {
        validations[field] = fieldRules.split('|');
      } else if (Array.isArray(fieldRules)) {
        validations[field] = fieldRules;
      }
    }

    return validations;
  }

  _validateRule(rule, value, params, field, data) {
    switch (rule) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'min':
        if (typeof value === 'string') return value.length >= parseInt(params[0]);
        if (typeof value === 'number') return value >= parseInt(params[0]);
        if (Array.isArray(value)) return value.length >= parseInt(params[0]);
        return false;
      
      case 'max':
        if (typeof value === 'string') return value.length <= parseInt(params[0]);
        if (typeof value === 'number') return value <= parseInt(params[0]);
        if (Array.isArray(value)) return value.length <= parseInt(params[0]);
        return false;
      
      case 'string':
        return typeof value === 'string';
      
      case 'numeric':
        return !isNaN(value);
      
      case 'array':
        return Array.isArray(value);
      
      case 'file':
        return value instanceof File || (value && value.buffer);
      
      case 'mimes':
        if (!value || !value.mimetype) return false;
        return params.some(mime => value.mimetype.includes(mime));
      
      case 'regex':
        const pattern = new RegExp(params[0].replace(/^\/|\/$/g, ''));
        return pattern.test(value);
      
      case 'same':
        return value === data[params[0]];
      
      case 'exists':
        // TODO: Implement database check
        return true;
      
      case 'in':
        return params[0].split(',').includes(value);
      
      case 'required_if':
        const [otherField, expectedValue] = params;
        return data[otherField] === expectedValue ? this._validateRule('required', value) : true;
      
      case 'date':
        return !isNaN(Date.parse(value));
      
      case 'unique':
        // TODO: Implement database check
        return true;
      
      default:
        return true;
    }
  }

  _formatMessage(rule, attribute, params, data) {
    let message = validationMessages[rule] || `Trường ${this._getAttributeLabel(attribute)} không hợp lệ.`;
    
    if (typeof message === 'object') {
      const type = this._getAttributeType(attribute);
      message = message[type] || message.string;
    }

    // Replace placeholders
    message = message.replace(':attribute', this._getAttributeLabel(attribute));
    
    if (params.length) {
      if (rule === 'same') {
        message = message.replace(':other', this._getAttributeLabel(params[0]));
      } else if (rule === 'required_if') {
        const [otherField, value] = params;
        message = message
          .replace(':other', this._getAttributeLabel(otherField))
          .replace(':value', value);
      } else {
        message = message
          .replace(':min', params[0])
          .replace(':max', params[0])
          .replace(':size', params[0])
          .replace(':values', params.join(', '))
          .replace(':date', params[0]);
      }
    }

    return message;
  }

  _getAttributeLabel(attribute) {
    return this.attributes[attribute] || attribute;
  }

  _getAttributeType(attribute) {
    const attr = this.attributes[attribute];
    if (!attr) return 'string';
    
    switch (attr.type) {
      case 'integer':
      case 'float':
      case 'decimal':
        return 'numeric';
      case 'file':
        return 'file';
      default:
        return attr.type;
    }
  }

  getErrors() {
    return this.errors;
  }

  // Database methods that can be implemented
  async findById(id) {
    // TODO: Implement database query
  }

  async findByField(field, value) {
    // TODO: Implement database query
  }

  async create(data) {
    // TODO: Implement database insert
  }

  async update(id, data) {
    // TODO: Implement database update
  }

  async delete(id) {
    // TODO: Implement database delete
  }
}

module.exports = BaseModel; 