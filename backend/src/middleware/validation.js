const Joi = require('joi');
const BaseProvider = require('../providers/BaseProvider');

class Validator extends BaseProvider {
  constructor() {
    super();
    this.errors = [];
  }

  validate(schema, data) {
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      this.errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      return false;
    }
    
    return true;
  }

  getErrors() {
    return this.errors;
  }
}

class AuthValidator extends Validator {
  constructor() {
    super();
    this.userSchema = Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Trường :attribute phải có ít nhất 2 ký tự',
          'string.max': 'Trường :attribute không được vượt quá 50 ký tự',
          'any.required': 'Trường :attribute không được bỏ trống'
        }),

      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Trường :attribute phải là một địa chỉ email hợp lệ',
          'any.required': 'Trường :attribute không được bỏ trống'
        }),

      password: Joi.string()
        .min(6)
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$'))
        .messages({
          'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
          'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt',
          'any.required': 'Trường mật khẩu không được bỏ trống'
        }),

      avatar: Joi.any()
        .messages({
          'any.required': 'Vui lòng chọn ảnh đại diện'
        })
    });

    this.loginSchema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Vui lòng nhập địa chỉ email hợp lệ',
          'any.required': 'Vui lòng nhập địa chỉ email'
        }),

      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Vui lòng nhập mật khẩu'
        })
    });
  }

  validateRegistration(req, res, next) {
    if (!this.validate(this.userSchema, req.body)) {
      return res.status(400).json(
        this.error('Validation failed', this.getErrors())
      );
    }
    next();
  }

  validateLogin(req, res, next) {
    if (!this.validate(this.loginSchema, req.body)) {
      return res.status(400).json(
        this.error('Validation failed', this.getErrors())
      );
    }
    next();
  }
}

module.exports = new AuthValidator(); 