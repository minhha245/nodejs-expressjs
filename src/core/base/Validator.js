const Joi = require('joi');

class Validator {
  constructor() {
    if (this.constructor === Validator) {
      throw new Error('Abstract class "Validator" cannot be instantiated directly');
    }
  }

  validate(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }));
        return res.status(400).json({ errors });
      }
      
      next();
    };
  }

  validateQuery(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.query, { abortEarly: false });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }));
        return res.status(400).json({ errors });
      }
      
      next();
    };
  }

  validateParams(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.params, { abortEarly: false });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }));
        return res.status(400).json({ errors });
      }
      
      next();
    };
  }
}

module.exports = Validator; 