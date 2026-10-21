import { randomBytes, timingSafeEqual, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Application, Recommendation, Resume, User } from "../models/index.js";

const scrypt = promisify(scryptCallback);
const PASSWORD_HASH_BYTES = 64;
const SESSION_DURATION = "7d";

function createError(status, message, details = []) {
  return Object.assign(new Error(message), { status, details });
}

function validateCredentials({ fullName, email, password }, isRegistration = false) {
  const details = [];

  if (
    isRegistration &&
    (typeof fullName !== "string" || !fullName.trim() || fullName.length > 120)
  ) {
    details.push("Full name is required and must be 120 characters or fewer.");
  }
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    details.push("Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    details.push("Password must be between 8 and 128 characters.");
  }
  if (details.length) {
    throw createError(400, "Please check the submitted details.", details);
  }
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, PASSWORD_HASH_BYTES);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, passwordHash) {
  if (typeof passwordHash !== "string") return false;
  const match = /^scrypt\$([a-f\d]{32})\$([a-f\d]{128})$/i.exec(passwordHash);
  if (!match) {
    return false;
  }

  const [, saltHex, hashHex] = match;
  const expectedKey = Buffer.from(hashHex, "hex");
  const actualKey = await scrypt(password, Buffer.from(saltHex, "hex"), expectedKey.length);
  return expectedKey.length === actualKey.length && timingSafeEqual(expectedKey, actualKey);
}

function createToken(userId) {
  if (env.jwtSecret.length < 32) {
    throw createError(500, "Authentication is not configured.");
  }

  return jwt.sign({}, env.jwtSecret, {
    algorithm: "HS256",
    subject: userId.toString(),
    expiresIn: SESSION_DURATION,
  });
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
  };
}

function createSession(user) {
  return { token: createToken(user._id), user: serializeUser(user) };
}

export async function registerUser(credentials) {
  validateCredentials(credentials, true);
  const normalizedEmail = credentials.email.trim().toLowerCase();
  const password = await hashPassword(credentials.password);

  try {
    const user = await User.create({
      fullName: credentials.fullName.trim(),
      email: normalizedEmail,
      password,
    });
    return createSession(user);
  } catch (error) {
    if (error.code === 11000) {
      throw createError(409, "An account with this email already exists.");
    }
    throw error;
  }
}

export async function loginUser(credentials) {
  validateCredentials(credentials);
  const email = credentials.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+password");
  const isPasswordValid = user && (await verifyPassword(credentials.password, user.password));

  if (!isPasswordValid) {
    throw createError(401, "Email or password is incorrect.");
  }
  return createSession(user);
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId).select("fullName email");
  if (!user) {
    throw createError(401, "Session is invalid or has expired.");
  }
  return serializeUser(user);
}

export async function updateProfile(userId, input) {
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const details = [];
  if (!fullName || fullName.length > 120) {
    details.push("Full name is required and must be 120 characters or fewer.");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    details.push("Enter a valid email address.");
  }
  if (details.length) throw createError(400, "Please check the submitted details.", details);

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, email },
      { new: true, runValidators: true }
    );
    if (!user) throw createError(404, "Account not found.");
    return serializeUser(user);
  } catch (error) {
    if (error.code === 11000) {
      throw createError(409, "An account with this email already exists.");
    }
    throw error;
  }
}

export async function changePassword(userId, input) {
  if (
    typeof input.currentPassword !== "string" ||
    typeof input.newPassword !== "string" ||
    input.newPassword.length < 8 ||
    input.newPassword.length > 128
  ) {
    throw createError(400, "Please check the submitted details.", [
      "Enter your current password and a new password between 8 and 128 characters.",
    ]);
  }
  const user = await User.findById(userId).select("+password");
  if (!user) throw createError(404, "Account not found.");
  if (!(await verifyPassword(input.currentPassword, user.password))) {
    throw createError(401, "Current password is incorrect.");
  }
  user.password = await hashPassword(input.newPassword);
  await user.save();
}

export async function deleteAccount(userId, password) {
  if (typeof password !== "string" || !password) {
    throw createError(400, "Enter your password to delete your account.");
  }
  const user = await User.findById(userId).select("+password");
  if (!user || !(await verifyPassword(password, user.password))) {
    throw createError(401, "Password is incorrect.");
  }

  await Promise.all([
    Application.deleteMany({ userId }),
    Recommendation.deleteMany({ userId }),
    Resume.deleteMany({ userId }),
  ]);
  await User.deleteOne({ _id: userId });
}
