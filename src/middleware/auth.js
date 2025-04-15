const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  // Verify JWT token middleware
  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token error' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token malformatted' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.userId = decoded.id;
      return next();
    });
  }
};

module.exports = auth; 