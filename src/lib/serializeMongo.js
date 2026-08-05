import mongoose from "mongoose";

/**
 * Convert MongoDB/Mongoose values to plain JSON-safe objects for Client Components.
 */
export function serializeForClient(value) {
  return JSON.parse(JSON.stringify(value, (_key, val) => {
    if (val instanceof mongoose.Types.ObjectId) {
      return val.toString();
    }

    if (val instanceof Date) {
      return val.toISOString();
    }

    // BSON ObjectId sometimes appears as { buffer: ... } in lean docs
    if (
      val &&
      typeof val === "object" &&
      val.buffer &&
      typeof val.buffer === "object" &&
      !Array.isArray(val)
    ) {
      try {
        return new mongoose.Types.ObjectId(val.buffer).toString();
      } catch {
        return val;
      }
    }

    return val;
  }));
}
