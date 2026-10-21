import { DOMParser } from "@xmldom/xmldom";
import { unzipSync, strFromU8 } from "fflate";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mongoose from "mongoose";
import { Resume } from "../models/index.js";

const MINIMUM_RESUME_TEXT_LENGTH = 100;
const MAXIMUM_ARCHIVE_SIZE = 20 * 1024 * 1024;
const MAXIMUM_PDF_HEADER_OFFSET = 1024;

function createError(status, message, details = []) {
  return Object.assign(new Error(message), { status, details });
}

function validateArchiveSize(buffer) {
  const minimumOffset = Math.max(0, buffer.length - 65557);
  let endRecordOffset = -1;
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endRecordOffset = offset;
      break;
    }
  }
  if (endRecordOffset < 0) throw createError(400, "The DOCX archive is invalid.");

  const entryCount = buffer.readUInt16LE(endRecordOffset + 10);
  const directoryOffset = buffer.readUInt32LE(endRecordOffset + 16);
  let offset = directoryOffset;
  let totalUncompressedSize = 0;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw createError(400, "The DOCX archive is invalid.");
    }
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    if (uncompressedSize === 0xffffffff) {
      throw createError(400, "ZIP64 DOCX files are not supported.");
    }
    totalUncompressedSize += uncompressedSize;
    if (totalUncompressedSize > MAXIMUM_ARCHIVE_SIZE) {
      throw createError(413, "The expanded DOCX content is too large to process.");
    }
    offset +=
      46 +
      buffer.readUInt16LE(offset + 28) +
      buffer.readUInt16LE(offset + 30) +
      buffer.readUInt16LE(offset + 32);
  }
}

async function extractText(file) {
  const extension = file.originalname.toLowerCase().split(".").pop();
  const pdfHeaderOffset = file.buffer.indexOf("%PDF-");
  if (extension === "pdf" && pdfHeaderOffset >= 0 && pdfHeaderOffset < MAXIMUM_PDF_HEADER_OFFSET) {
    const parsed = await pdfParse(file.buffer);
    return parsed.text.trim();
  }
  if (extension === "docx" && file.buffer.subarray(0, 2).toString() === "PK") {
    validateArchiveSize(file.buffer);
    const documentXml = unzipSync(file.buffer)["word/document.xml"];
    if (!documentXml) throw createError(400, "The DOCX file does not contain a document.");
    const document = new DOMParser().parseFromString(strFromU8(documentXml), "application/xml");
    return Array.from(document.getElementsByTagName("w:p"))
      .map((paragraph) =>
        Array.from(paragraph.getElementsByTagName("w:t"))
          .map((node) => node.textContent)
          .join("")
      )
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  throw createError(400, "The file is not a valid PDF or DOCX document.");
}

function serializeResume(resume) {
  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    extractedText: resume.extractedText,
    isBaseResume: resume.isBaseResume,
    tailoredFromResumeId: resume.tailoredFromResumeId?.toString() || null,
    applicationId:
      resume.applicationId?._id?.toString() || resume.applicationId?.toString() || null,
    application: resume.applicationId?.companyName
      ? {
          company: resume.applicationId.companyName,
          jobTitle: resume.applicationId.jobTitle,
        }
      : null,
    company: resume.applicationId?.companyName || "",
    jobTitle: resume.applicationId?.jobTitle || "",
    baseResume: resume.tailoredFromResumeId?.fileName || null,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
}

export async function uploadBaseResume(userId, file) {
  if (!file) {
    throw createError(400, "Choose a PDF or DOCX file.");
  }
  if (!/\.(pdf|docx)$/i.test(file.originalname)) {
    throw createError(400, "Choose a PDF or DOCX file.");
  }

  let extractedText;
  try {
    extractedText = await extractText(file);
  } catch (error) {
    if (error.status) throw error;
    throw createError(422, "We could not extract readable text from this file.");
  }
  if (extractedText.length < MINIMUM_RESUME_TEXT_LENGTH) {
    throw createError(
      422,
      "This CV contains too little readable text. If it is an image-only PDF, use a text-based PDF or DOCX."
    );
  }
  if (extractedText.length > 100000) {
    throw createError(422, "The extracted CV text is too long to store.");
  }

  let resume = await Resume.findOne({ userId, isBaseResume: true });
  if (resume) {
    resume.isBaseResume = false;
    await resume.save();
  }
  resume = await Resume.create({
    userId,
    fileName: file.originalname,
    extractedText,
    isBaseResume: true,
  });
  return serializeResume(resume);
}

export async function listResumes(userId) {
  const resumes = await Resume.find({ userId })
    .sort({ createdAt: -1 })
    .populate({ path: "applicationId", select: "companyName jobTitle" })
    .populate({ path: "tailoredFromResumeId", select: "fileName" });
  const baseResume = resumes.find((resume) => resume.isBaseResume) || null;
  return {
    baseResume: baseResume ? serializeResume(baseResume) : null,
    tailoredResumes: resumes.filter((resume) => !resume.isBaseResume).map(serializeResume),
  };
}

export async function deleteTailoredResume(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw createError(404, "CV not found.");
  const resume = await Resume.findOneAndDelete({ _id: id, userId, isBaseResume: false });
  if (!resume) throw createError(404, "CV not found.");
}
