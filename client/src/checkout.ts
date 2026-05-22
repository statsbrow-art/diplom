export interface CheckoutSeat {
  ticketTypeId: string;
  row: number;
  number: number;
}

export interface CheckoutPayload {
  eventId: string;
  seats: CheckoutSeat[];
}

const checkoutKey = 'checkoutPayload';

export function saveCheckout(payload: CheckoutPayload) {
  sessionStorage.setItem(checkoutKey, JSON.stringify(payload));
}

export function loadCheckout(): CheckoutPayload | null {
  const raw = sessionStorage.getItem(checkoutKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutPayload;
  } catch {
    sessionStorage.removeItem(checkoutKey);
    return null;
  }
}

export function clearCheckout() {
  sessionStorage.removeItem(checkoutKey);
}
