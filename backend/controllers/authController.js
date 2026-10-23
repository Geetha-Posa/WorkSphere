const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// Helper: SHA-256 hash
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper: Generate 48-byte secure random hex opaque token
const generateRawRefreshToken = () => {
  return crypto.randomBytes(48).toString('hex');
};

// Helper: TTL days for refresh token
const getRefreshTokenTtlDays = () => {
  return parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7', 10);
};

// Helper: Cookie options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSiteEnv = (process.env.COOKIE_SAME_SITE || process.env.SAME_SITE || 'lax').toLowerCase();
  const sameSite = sameSiteEnv === 'none' ? 'none' : sameSiteEnv === 'strict' ? 'strict' : 'lax';

  let secure = false;
  if (process.env.COOKIE_SECURE !== undefined) {
    secure = process.env.COOKIE_SECURE === 'true';
  } else if (process.env.SECURE !== undefined) {
    secure = process.env.SECURE === 'true';
  } else {
    secure = isProduction;
  }

  // Cross-domain deploy: sameSite=none requires secure=true
  if (sameSite === 'none') {
    secure = true;
  }

  const ttlDays = getRefreshTokenTtlDays();
  const maxAge = ttlDays * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    path: '/api/auth',
    maxAge,
    sameSite,
    secure,
  };
};

const getClearCookieOptions = () => {
  const { httpOnly, path, sameSite, secure } = getCookieOptions();
  return { httpOnly, path, sameSite, secure };
};

// Helper: Generate Access Token
const generateAccessToken = (user) => {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.ACCESS_TOKEN_TTL || '30s';
  return jwt.sign(
    { id: user._id, role: user.role, team: user.team },
    secret,
    { expiresIn }
  );
};

// Helper: Format user response payload
const formatUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  team: user.team,
  expertiseTags: user.expertiseTags || [],
});

/**
 * POST /api/auth/login
 * Validates credentials, issues access token & refresh token, sets cookie.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);

    // Generate and persist refresh token
    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const ttlDays = getRefreshTokenTtlDays();
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    res.cookie('refreshToken', rawRefreshToken, getCookieOptions());

    res.json({
      accessToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/auth/refresh
 * Reads cookie, hashes, verifies.
 * Missing/expired -> 401.
 * Revoked -> revoke ALL user's refresh tokens, 401.
 * Otherwise rotates: revokes old, creates new, sets cookie, returns { accessToken, user }.
 */
const refreshUserToken = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (!rawRefreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash });

    if (!tokenDoc) {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json({ message: 'Refresh token invalid' });
    }

    // Reuse detection: If token was already revoked, revoke ALL user refresh tokens
    if (tokenDoc.revokedAt || tokenDoc.replacedBy) {
      await RefreshToken.updateMany(
        { user: tokenDoc.user, revokedAt: null },
        { revokedAt: new Date() }
      );
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    // Check expiration
    if (tokenDoc.expiresAt < new Date()) {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const user = await User.findById(tokenDoc.user);
    if (!user) {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json({ message: 'User not found' });
    }

    // Rotate refresh token
    const newRawRefreshToken = generateRawRefreshToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const ttlDays = getRefreshTokenTtlDays();
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    // Revoke old token and record replacement
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedBy = newTokenHash;
    await tokenDoc.save();

    // Create new token record
    await RefreshToken.create({
      user: user._id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    res.cookie('refreshToken', newRawRefreshToken, getCookieOptions());

    const accessToken = generateAccessToken(user);

    return res.json({
      accessToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ message: 'Server error during token refresh' });
  }
};

/**
 * POST /api/auth/logout
 * Revokes presented token, clears cookie, returns 204.
 */
const logoutUser = async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.updateOne(
        { tokenHash, revokedAt: null },
        { revokedAt: new Date() }
      );
    }

    res.clearCookie('refreshToken', getClearCookieOptions());
    return res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('refreshToken', getClearCookieOptions());
    return res.status(204).send();
  }
};

module.exports = {
  loginUser,
  refreshUserToken,
  logoutUser,
};
