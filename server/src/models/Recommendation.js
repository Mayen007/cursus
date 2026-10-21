import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["required", "preferred"],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    sourceLine: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    lineNumber: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  { _id: false }
);

const recommendationItemSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    suggestedText: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
    index: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
    index: true,
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    validate: Number.isInteger,
  },
  missingKeywords: {
    type: [keywordSchema],
    default: [],
  },
  recommendations: {
    type: [recommendationItemSchema],
    default: [],
  },
});

export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
