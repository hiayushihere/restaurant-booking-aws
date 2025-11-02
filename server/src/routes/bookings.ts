import { Router } from "express";
import { Booking } from "../models/Booking";
import { Table } from "../models/Table";
import { createBookingSchema } from "../utils/validate";
import { makeQrDataUrl } from "../utils/qr";
import { adminOnly } from "../middleware/auth";

function shortCode() {
  // simple 6-char code
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const router = Router();

// Create booking
router.post("/", async (req, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const table = await Table.findById(data.tableId);
    if (!table || !table.isActive) return res.status(400).json({ error: "Invalid table" });
    if (data.partySize > table.capacity) {
      return res.status(400).json({ error: "Party size exceeds table capacity" });
    }

    const when = new Date(data.time);
    // simple 2-hour block rule: no bookings for same table within +/- 2 hours
    const start = new Date(when.getTime() - 2 * 60 * 60 * 1000);
    const end = new Date(when.getTime() + 2 * 60 * 60 * 1000);
    const clash = await Booking.findOne({
      table: table._id,
      time: { $gte: start, $lte: end },
      status: "CONFIRMED"
    });

    if (clash) return res.status(409).json({ error: "Time slot not available for this table" });

    const code = shortCode();
    const created = await Booking.create({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      partySize: data.partySize,
      time: when,
      table: table._id,
      code,
      note: data.note
    });

    const qr = await makeQrDataUrl(code);
    res.status(201).json({ booking: created, qr });
  } catch (e) { next(e); }
});

// Public: check availability summary for a date (optional nice feature)
router.get("/availability", async (req, res, next) => {
  try {
    const dateStr = String(req.query.date); // yyyy-mm-dd
    if (!dateStr) return res.status(400).json({ error: "date query required (YYYY-MM-DD)" });
    const dayStart = new Date(dateStr + "T00:00:00.000Z");
    const dayEnd = new Date(dateStr + "T23:59:59.999Z");
    const tables = await Table.find({ isActive: true });

    const bookings = await Booking.find({
      time: { $gte: dayStart, $lte: dayEnd },
      status: "CONFIRMED"
    }).populate("table");

    const map: Record<string, any> = {};
    tables.forEach(t => map[t.id] = { tableId: t.id, name: t.name, capacity: t.capacity, times: [] as string[] });
    bookings.forEach(b => {
      const t = map[(b.table as any).id];
      if (t) t.times.push(b.time.toISOString());
    });
    res.json(Object.values(map));
  } catch (e) { next(e); }
});

// Admin: list bookings (with pagination)
router.get("/", adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
    const limit = Math.max(parseInt(String(req.query.limit || "10"), 10), 1);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("table"),
      Booking.countDocuments()
    ]);
    res.json({ items, page, total, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// Admin: cancel booking
router.patch("/:id/cancel", adminOnly, async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    b.status = "CANCELLED";
    await b.save();
    res.json(b);
  } catch (e) { next(e); }
});

// Public: verify QR code
router.get("/verify/:code", async (req, res, next) => {
  try {
    const b = await Booking.findOne({ code: req.params.code, status: "CONFIRMED" }).populate("table");
    if (!b) return res.status(404).json({ valid: false });
    res.json({ valid: true, booking: b });
  } catch (e) { next(e); }
});

export default router;
