import { Model } from 'mongoose';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Short, human-readable, non-ambiguous code, e.g. SR-7K4M2Q. */
export function trackingCode(prefix: string, length = 6): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${prefix}-${out}`;
}

/**
 * Year-scoped sequential document number, e.g. QT-2026-0042.
 * Counts existing docs for the current year and pads the next index.
 */
export async function nextDocNumber(
  model: Model<any>,
  field: string,
  prefix: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const stem = `${prefix}-${year}-`;
  const last = await model
    .findOne({ [field]: { $regex: `^${stem}` } })
    .sort({ [field]: -1 })
    .select(field)
    .lean();

  const lastSeq = last ? Number(String((last as any)[field]).slice(stem.length)) : 0;
  return `${stem}${String(lastSeq + 1).padStart(4, '0')}`;
}
