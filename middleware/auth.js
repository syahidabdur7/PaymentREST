const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ status: "error", message: "No token provided" });

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }
}

module.exports = auth;