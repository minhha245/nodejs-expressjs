const BaseValidator = require('./baseValidator');

class AuthValidator extends BaseValidator {
  constructor() {
    super();
    this.rules = {
      login: {
        email: ['required', 'email'],
        password: ['required', 'min:6']
      },
      register: {
        email: ['required', 'email', 'unique:users'],
        password: ['required', 'min:6', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$/'],
        password_confirm: ['required', 'same:password'],
        first_name: ['required', 'string', 'max:50'],
        last_name: ['required', 'string', 'max:50']
      }
    };
  }

  async validateLogin(req, res, next) {
    const validation = await this.validate(req.body, this.rules.login);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.errors });
    }
    next();
  }

  async validateRegister(req, res, next) {
    const validation = await this.validate(req.body, this.rules.register);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.errors });
    }
    next();
  }
}

module.exports = new AuthValidator(); 