import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyEmail(email, otp);
      res.json({ message: 'Email verified successfully. Welcome!', data: result });
    } catch (err) { next(err); }
  },

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.resendOtp(email);
      res.json(result);
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, phone: true },
      });
      res.json({ user });
    } catch (err) { next(err); }
  },

  async createAgent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.createAgentUser(req.body);
      res.status(201).json({ user });
    } catch (err) { next(err); }
  },

  async getCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customers = await prisma.user.findMany({
        where: { role: 'customer' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: {
            select: { ordersAsCustomer: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ customers });
    } catch (err) { next(err); }
  },

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential, role } = req.body;
      if (!credential) {
        res.status(400).json({ message: 'Missing Google credential' });
        return;
      }
      const result = await authService.googleLogin(credential, role);
      res.json(result);
    } catch (err) { next(err); }
  },
};