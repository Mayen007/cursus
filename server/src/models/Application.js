import mongoose from "mongoose";
import {
  APPLICATION_STATUS_VALUES,
  DEFAULT_APPLICATION_STATUS,
} from "../../../shared/applicationStatuses.js";

const statusHistorySchema = new mongoose.Schema(
  {
    fromStatus: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      default: null,
    },
    toStatus: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  platform: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "",
  },
  jobDescription: {
    type: String,
    trim: true,
    maxlength: 50000,
    default: "",
  },
  applicationStatus: {
    type: String,
    enum: APPLICATION_STATUS_VALUES,
    required: true,
    default: DEFAULT_APPLICATION_STATUS,
  },
  applicationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  followUpDate: {
    type: Date,
    default: null,
  },
  // Intentional proposal addition: keep status changes here for APP-6.
  statusHistory: {
    type: [statusHistorySchema],
    default: () => [{ toStatus: DEFAULT_APPLICATION_STATUS }],
  },
});

applicationSchema.index({ userId: 1, applicationDate: -1 });
applicationSchema.index({ userId: 1, applicationStatus: 1 });

export const Application = mongoose.model("Application", applicationSchema);
