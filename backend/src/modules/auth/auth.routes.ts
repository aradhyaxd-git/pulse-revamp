import { Router } from 'express';
import { authController } from './auth.controller';
import { authGuard } from '../../middleware/authGuard';
import { roleGuard } from '../../middleware/roleGuard';

const router = Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);   // Google OAuth
router.get('/me', authGuard, authController.me);
router.post('/agents', authGuard, roleGuard('admin'), authController.createAgent);
router.get('/customers', authGuard, roleGuard('admin'), authController.getCustomers);

export default router;