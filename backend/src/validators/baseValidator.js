const validationMessages = require('../messages/validation');

class BaseValidator {
  constructor() {
    this.errors = [];
  }

  async validate(data, rules) {
    this.errors = [];
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      
      for (const rule of fieldRules) {
        const [ruleName, ...params] = rule.split(':');
        const ruleParams = params.length ? params[0].split(',') : [];
        
        if (!await this._validateRule(ruleName, value, ruleParams, field, data)) {
          this.errors.push({
            field,
            message: this._formatMessage(ruleName, field, ruleParams, data)
          });
          break; // Stop validating this field after first error
        }
      }
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors
    };
  }

  async _validateRule(rule, value, params, field, data) {
    switch (rule) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'min':
        if (typeof value === 'string') return value.length >= parseInt(params[0]);
        if (typeof value === 'number') return value >= parseInt(params[0]);
        return false;
      
      case 'max':
        if (typeof value === 'string') return value.length <= parseInt(params[0]);
        if (typeof value === 'number') return value <= parseInt(params[0]);
        return false;
      
      case 'string':
        return typeof value === 'string';
      
      case 'regex':
        const pattern = new RegExp(params[0].replace(/^\/|\/$/g, ''));
        return pattern.test(value);
      
      case 'same':
        return value === data[params[0]];
      
      case 'unique':
        // TODO: Implement database check
        const [table, column = field] = params[0].split(',');
        // Return true for now, implement actual check later
        return true;
      
      case 'file':
        return value && (value.buffer || value instanceof File);
      
      case 'mimes':
        if (!value || !value.mimetype) return false;
        return params.some(mime => value.mimetype.includes(mime));
      
      default:
        return true;
    }
  }

  _formatMessage(rule, field, params, data) {
    let message = validationMessages[rule] || `Trường ${field} không hợp lệ`;
    
    // Replace placeholders
    message = message.replace(':attribute', field);
    
    if (params.length) {
      if (rule === 'same') {
        message = message.replace(':other', params[0]);
      } else {
        message = message
          .replace(':min', params[0])
          .replace(':max', params[0])
          .replace(':values', params.join(', '));
      }
    }

    return message;
  }
}

module.exports = BaseValidator; 