import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    extractedText: {
      type: String,
      required: true,
      maxlength: 100000,
    },
    isBaseResume: {
      type: Boolean,
      required: true,
      default: false,
    },
    tailoredFromResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
  },
  { timestamps: true }
);

resumeSchema.index(
  { userId: 1, isBaseResume: 1 },
  { unique: true, partialFilterExpression: { isBaseResume: true } }
);
resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model("Resume", resumeSchema);
