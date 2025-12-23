export type BookingDraft = {
  selectedFlight: any;
  pricing: any;
  paxConfig: any;
  fare?: any;
  row?: any;
  createdAt: number;
};

const KEY_PREFIX = "BOOKING_DRAFT__";

export function createDraftId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function saveDraft(id: string, draft: BookingDraft) {
  sessionStorage.setItem(KEY_PREFIX + id, JSON.stringify(draft));
}

export function loadDraft(id: string): BookingDraft | null {
  const raw = sessionStorage.getItem(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft(id: string) {
  sessionStorage.removeItem(KEY_PREFIX + id);
}
