import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided in auth header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token received:', token.substring(0, 20) + '...');

  try {
    console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'Present' : 'Missing');
    console.log('Token to verify:', token.substring(0, 50) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded; // decoded contains { id, role }
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    console.log('Error details:', err);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
