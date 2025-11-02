import { Schema, model } from "mongoose";

export interface ITable {
  name: string;               // e.g., T1, Window-2
  capacity: number;           // seats
  isActive: boolean;          // can be booked?
}

const tableSchema = new Schema<ITable>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Table = model<ITable>("Table", tableSchema);
