import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { analyzeTailoring, saveAnalyzedResume } from "../services/tailoringService.js";

const router = Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

router.use(requireAuth);

router.post(
  "/analyze",
  asyncHandler(async (req, res) => {
    res.json({ analysis: await analyzeTailoring(req.userId, req.body || {}) });
  })
);

router.post(
  "/save",
  asyncHandler(async (req, res) => {
    res.status(201).json({
      resume: await saveAnalyzedResume(req.userId, req.body?.recommendationId),
    });
  })
);

export default router;
