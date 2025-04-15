const BaseValidator = require('./baseValidator');

class UserValidator extends BaseValidator {
  constructor() {
    super();
    this.rules = {
      update: {
        first_name: ['string', 'max:50'],
        last_name: ['string', 'max:50'],
        email: ['email', 'unique:users'],
        tel: ['regex:/^[0-9]{10,11}$/'],
        avatar: ['file', 'mimes:jpeg,png', 'max:5120']
      },
      changePassword: {
        current_password: ['required', 'min:6'],
        new_password: ['required', 'min:6', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$/'],
        password_confirm: ['required', 'same:new_password']
      }
    };
  }

  async validateUpdate(req, res, next) {
    const validation = await this.validate(req.body, this.rules.update);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.errors });
    }
    next();
  }

  async validateChangePassword(req, res, next) {
    const validation = await this.validate(req.body, this.rules.changePassword);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.errors });
    }
    next();
  }
}

module.exports = new UserValidator(); 