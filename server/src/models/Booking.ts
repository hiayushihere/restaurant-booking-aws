import { Schema, model, Types } from "mongoose";

export interface IBooking {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  time: Date;           // reservation time
  table: Types.ObjectId; // ref Table
  code: string;          // short code for QR
  status: "CONFIRMED" | "CANCELLED";
  note?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    partySize: { type: Number, required: true, min: 1 },
    time: { type: Date, required: true },
    table: { type: Schema.Types.ObjectId, ref: "Table", required: true },
    code: { type: String, required: true, unique: true },
    status: { type: String, enum: ["CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
    note: { type: String }
  },
  { timestamps: true }
);

bookingSchema.index({ table: 1, time: 1 }, { unique: false });

export const Booking = model<IBooking>("Booking", bookingSchema);
