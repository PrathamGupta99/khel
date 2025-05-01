import jwt from "jsonwebtoken";

/**
 * Create a signed JWT containing the given payload.
 * @param {Object} payload - Data to include in the token (e.g. { id, isAdmin }).
 * @returns {string} - A JWT valid for 7 days.
 */
export function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

/**
 * Verify a JWT and return its decoded payload.
 * @param {string} token - The JWT to verify (without “Bearer ” prefix).
 * @returns {Object|null} - Decoded payload if valid, or null if invalid/expired.
 */
export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
