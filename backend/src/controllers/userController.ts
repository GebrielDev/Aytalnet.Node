import { Request, Response } from 'express';
import { User } from '../models';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
      res.status(400).json({ error: 'Email, name, password, and role are required' });
      return;
    }

    if (!['admin', 'dispatcher'].includes(role)) {
      res.status(400).json({ error: 'Role must be admin or dispatcher' });
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    // passwordHash field will be auto-hashed by the beforeCreate hook
    const user = await User.create({ email, name, passwordHash: password, role });
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { email, name, password, role } = req.body;

    if (role && !['admin', 'dispatcher'].includes(role)) {
      res.status(400).json({ error: 'Role must be admin or dispatcher' });
      return;
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        res.status(409).json({ error: 'A user with this email already exists' });
        return;
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) {
      // Setting passwordHash triggers the beforeUpdate hook to hash it
      user.passwordHash = password;
    }

    await user.save();

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting yourself
    if (req.user && req.user.id === user.id) {
      res.status(400).json({ error: 'You cannot delete your own account' });
      return;
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
