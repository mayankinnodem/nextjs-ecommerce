import mongoose from "mongoose";

function isObjectIdLike(val) {
  if (!val || typeof val !== "object") return false;
  if (val instanceof mongoose.Types.ObjectId) return true;
  if (val._bsontype === "ObjectId") return true;
  // Lean docs sometimes expose ObjectId as { buffer: Uint8Array|... }
  if (val.buffer && typeof val.buffer === "object" && !Array.isArray(val) && !("url" in val)) {
    return true;
  }
  return false;
}

function objectIdToString(val) {
  try {
    if (val instanceof mongoose.Types.ObjectId) return val.toString();
    if (typeof val.toString === "function" && val.toString !== Object.prototype.toString) {
      const s = val.toString();
      if (/^[a-f\d]{24}$/i.test(s)) return s;
    }
    if (val.buffer) return new mongoose.Types.ObjectId(val.buffer).toString();
  } catch {
    // fall through
  }
  return String(val);
}

/**
 * Convert MongoDB/Mongoose values to plain JSON-safe objects for Client Components.
 */
export function serializeForClient(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => {
      if (val instanceof Date) {
        return val.toISOString();
      }

      if (isObjectIdLike(val)) {
        return objectIdToString(val);
      }

      return val;
    })
  );
}
