import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-admin-token");
  if (token === CONFIG.ADMIN_TOKEN) return next();
  return res.status(401).json({ error: "Unauthorized" });
}
