import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  changePassword,
  deleteAccount,
  getCurrentUser,
  loginUser,
  registerUser,
  updateProfile,
} from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      error: "Too many login attempts. Try again later.",
      details: [],
    }),
});

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const session = await registerUser(req.body || {});
    res.status(201).json(session);
  })
);

router.post(
  "/login",
  loginRateLimit,
  asyncHandler(async (req, res) => {
    const session = await loginUser(req.body || {});
    res.status(200).json(session);
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.userId);
    res.status(200).json({ user });
  })
);

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await updateProfile(req.userId, req.body || {}) });
  })
);

router.patch(
  "/me/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    await changePassword(req.userId, req.body || {});
    res.status(204).end();
  })
);

router.delete(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await deleteAccount(req.userId, req.body?.password);
    res.status(204).end();
  })
);

export default router;
