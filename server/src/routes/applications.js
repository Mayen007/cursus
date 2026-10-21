import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  changeApplicationStatus,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "../services/applicationService.js";

const router = Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ applications: await listApplications(req.userId) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    res.status(201).json({ application: await createApplication(req.userId, req.body || {}) });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({ application: await updateApplication(req.userId, req.params.id, req.body || {}) });
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    res.json({
      application: await changeApplicationStatus(
        req.userId,
        req.params.id,
        req.body?.applicationStatus
      ),
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await deleteApplication(req.userId, req.params.id);
    res.status(204).end();
  })
);

export default router;
