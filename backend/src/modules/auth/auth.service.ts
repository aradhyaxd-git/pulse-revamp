import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Role } from '../../types';
import { createError } from '../../middleware/errorHandler';
import { cacheSet, cacheGet, cacheDel } from '../../lib/redis';
import { emailService } from '../../lib/email';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw createError('Email already registered', 409);

    const otp = generateOtp();
    const payload = { ...data, role: data.role || 'customer' };

    // Store in Redis for 10 minutes
    await cacheSet(`otp:${data.email}`, JSON.stringify({ otp, payload }), 600);

    // Send email
    const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `;
    await emailService.sendEmail(data.email, 'Verify your email', html);

    return { message: 'OTP sent to email', email: data.email };
  },

  async verifyEmail(email: string, otp: string) {
    const cachedStr = await cacheGet(`otp:${email}`);
    if (!cachedStr) throw createError('OTP expired or invalid', 400);

    const cachedData = JSON.parse(cachedStr);
    if (cachedData.otp !== otp) throw createError('Invalid OTP', 400);

    // Ensure email is not already taken (edge case if registered during verification)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw createError('Email already registered', 409);

    const payload = cachedData.payload;
    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        passwordHash,
        role: payload.role as Role,
        ...(payload.role === 'agent' ? {
          agent: {
            create: {
              slotLimit: 5,
            }
          }
        } : {})
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await cacheDel(`otp:${email}`);

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return {
      token,
      user,
    };
  },

  async resendOtp(email: string) {
    const cachedStr = await cacheGet(`otp:${email}`);
    if (!cachedStr) throw createError('Session expired. Please register again.', 400);

    const cachedData = JSON.parse(cachedStr);
    const newOtp = generateOtp();

    await cacheSet(`otp:${email}`, JSON.stringify({ ...cachedData, otp: newOtp }), 600);

    const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${newOtp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `;
    await emailService.sendEmail(email, 'Your New OTP', html);

    return { message: 'New OTP sent to email' };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw createError('Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async createAgentUser(data: { name: string; email: string; password: string; phone?: string; zoneId?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw createError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'agent',
        agent: {
          create: {
            zoneId: data.zoneId || null,
            slotLimit: 5,
          },
        },
      },
      include: { agent: true },
    });
    return user;
  },

  /**
   * Google OAuth login/register.
   * Verifies the Google access_token, finds or creates the user,
   * and returns a JWT + user — same shape as /auth/login.
   */
  async googleLogin(accessToken: string, role?: string) {
    // Fetch user info from Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) {
      throw createError('Invalid Google token', 401);
    }

    const googleUser = await googleRes.json() as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    if (!googleUser.email) {
      throw createError('Google did not return an email address', 422);
    }

    // Find existing user or create one
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    if (!user) {
      // Create new user with the chosen role (defaults to customer)
      const newRole = (role === 'agent' ? 'agent' : 'customer') as Role;
      user = await prisma.user.create({
        data: {
          name:         googleUser.name || googleUser.email.split('@')[0],
          email:        googleUser.email,
          passwordHash: '',       // No password for Google users
          role:         newRole,
          ...(newRole === 'agent' ? {
            agent: { create: { slotLimit: 5 } }
          } : {}),
        },
        select: { id: true, name: true, email: true, role: true, phone: true },
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },
};
