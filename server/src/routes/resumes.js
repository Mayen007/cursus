import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { deleteTailoredResume, listResumes, uploadBaseResume } from "../services/resumeService.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

function uploadBaseResumeFile(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      error.status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      error.message =
        error.code === "LIMIT_FILE_SIZE"
          ? "The file must be 5 MB or smaller."
          : "Upload one PDF or DOCX file.";
    }
    next(error);
  });
}

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await listResumes(req.userId));
  })
);

router.post(
  "/base",
  uploadBaseResumeFile,
  asyncHandler(async (req, res) => {
    res.status(201).json({ resume: await uploadBaseResume(req.userId, req.file) });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await deleteTailoredResume(req.userId, req.params.id);
    res.status(204).end();
  })
);

export default router;
