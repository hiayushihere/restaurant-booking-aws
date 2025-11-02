import { Router } from "express";
import { Table } from "../models/Table";
import { createTableSchema } from "../utils/validate";
import { adminOnly } from "../middleware/auth";

const router = Router();

// Public: list active tables
router.get("/", async (_req, res, next) => {
  try {
    const tables = await Table.find({ isActive: true }).sort({ capacity: 1 });
    res.json(tables);
  } catch (e) { next(e); }
});

// Admin: create table
router.post("/", adminOnly, async (req, res, next) => {
  try {
    const data = createTableSchema.parse(req.body);
    const created = await Table.create(data);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// Admin: toggle active
router.patch("/:id/toggle", adminOnly, async (req, res, next) => {
  try {
    const t = await Table.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Not found" });
    t.isActive = !t.isActive;
    await t.save();
    res.json(t);
  } catch (e) { next(e); }
});

export default router;
