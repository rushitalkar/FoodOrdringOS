import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) return res.status(401).json({ error: 'Access token is required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
