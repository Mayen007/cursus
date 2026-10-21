import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env.js";

function unauthorized(res) {
  return res.status(401).json({ error: "Authentication required.", details: [] });
}

export function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token, extra] = authorization.split(" ");

  if (scheme !== "Bearer" || !token || extra) {
    return unauthorized(res);
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    if (typeof payload !== "object" || !mongoose.isValidObjectId(payload.sub)) {
      return unauthorized(res);
    }
    req.userId = payload.sub;
    return next();
  } catch {
    return unauthorized(res);
  }
}
