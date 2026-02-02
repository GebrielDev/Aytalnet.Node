import { Request, Response } from 'express';
import { User, Driver } from '../models';
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
