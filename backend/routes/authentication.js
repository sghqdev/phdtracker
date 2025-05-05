import express from 'express';
import { signup, login, checkAuthStatus, getAdvisors } from '../controllers/authControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

console.log('Setting up authentication routes...');

// Route for user signup
router.post('/signup', signup);
console.log('Signup route registered at POST /signup');

// Route for user login
router.post('/login', login);
console.log('Login route registered at POST /login');

// Route to check authentication status - no protection needed
router.get('/status', checkAuthStatus);
console.log('Status route registered at GET /status');

// Route to get all advisors - no protection needed
router.get('/advisors', getAdvisors);
console.log('Advisors route registered at GET /advisors');

export default router;