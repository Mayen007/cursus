import { Router } from "express";
import applicationsRouter from "./applications.js";
import authRouter from "./auth.js";
import healthRouter from "./health.js";
import resumesRouter from "./resumes.js";
import tailoringRouter from "./tailoring.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/applications", applicationsRouter);
router.use("/resumes", resumesRouter);
router.use("/tailoring", tailoringRouter);
router.use("/health", healthRouter);

export default router;
