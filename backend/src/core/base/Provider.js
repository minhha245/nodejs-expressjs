class Provider {
  constructor() {
    if (this.constructor === Provider) {
      throw new Error('Abstract class "Provider" cannot be instantiated directly');
    }
  }

  // Common provider methods can be added here
  handleError(error) {
    console.error(`[${this.constructor.name}] Error:`, error);
    return {
      status: error.status || 500,
      message: error.message || 'Internal server error'
    };
  }

  success(data, message = 'Success') {
    return {
      success: true,
      message,
      data
    };
  }

  error(message, status = 400) {
    return {
      success: false,
      status,
      message
    };
  }
}

module.exports = Provider; 