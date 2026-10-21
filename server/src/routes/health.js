import { Router } from "express";
import { APP_NAME } from "../config/app.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", app: APP_NAME });
});

export default router;
