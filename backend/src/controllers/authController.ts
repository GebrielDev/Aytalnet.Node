import { Request, Response } from 'express';
import { User, Driver, PasswordResetToken } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.validatePassword(password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { id: user.id, email: user.email, type: 'user' as const };
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Login failed', details: String(error) });
  }
};

export const loginDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ where: { email } });

    if (!driver || driver.status !== 'active' || !(await driver.validatePassword(password))) {
      res.status(401).json({ error: 'Invalid credentials or inactive account' });
      return;
    }

    const payload = { id: driver.id, email: driver.email, type: 'driver' as const };
    res.json({
      driver: { id: driver.id, employeeId: driver.employeeId, email: driver.email, name: driver.name, phone: driver.phone },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const newPayload = { id: payload.id, email: payload.email, type: payload.type };
    res.json({
      accessToken: generateAccessToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    res.json({ type: 'user', user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role } });
  } else if (req.driver) {
    res.json({ type: 'driver', driver: { id: req.driver.id, employeeId: req.driver.employeeId, email: req.driver.email, name: req.driver.name } });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Periodically clean up expired tokens
    await PasswordResetToken.cleanExpired();

    const { email, type } = req.body;
    const accountType = type === 'driver' ? 'driver' : 'user';

    // Always respond with success to prevent email enumeration
    const successMsg = { message: 'If an account with that email exists, a reset link has been generated.' };

    let exists = false;
    if (accountType === 'driver') {
      const driver = await Driver.findOne({ where: { email } });
      exists = !!driver;
    } else {
      const user = await User.findOne({ where: { email } });
      exists = !!user;
    }

    if (!exists) {
      res.json(successMsg);
      return;
    }

    const token = await PasswordResetToken.createToken(email, accountType);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // TODO: Send resetLink via email in production
    console.log(`Password reset requested for ${email} (${accountType}): ${resetLink}`);

    res.json({
      ...successMsg,
      // Include resetToken in response for development/testing; remove in production
      resetToken: token,
      resetLink,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const resetRecord = await PasswordResetToken.findValidToken(token);
    if (!resetRecord) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    if (resetRecord.accountType === 'driver') {
      const driver = await Driver.findOne({ where: { email: resetRecord.email } });
      if (!driver) {
        res.status(400).json({ error: 'Account not found' });
        return;
      }
      driver.passwordHash = password; // beforeUpdate hook will hash it
      await driver.save();
    } else {
      const user = await User.findOne({ where: { email: resetRecord.email } });
      if (!user) {
        res.status(400).json({ error: 'Account not found' });
        return;
      }
      user.passwordHash = password; // beforeUpdate hook will hash it
      await user.save();
    }

    // Mark token as used
    resetRecord.usedAt = new Date();
    await resetRecord.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
