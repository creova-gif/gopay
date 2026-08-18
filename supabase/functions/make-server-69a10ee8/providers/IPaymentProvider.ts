/**
 * IPaymentProvider
 *
 * Abstraction so gopay's core transaction flow (wallet add-funds, send-money,
 * bill pay, etc.) never talks to a specific carrier API directly. Swapping
 * from the sandbox provider to a real one (Selcom, M-Pesa, ClickPesa) after
 * BoT licensing is a config change, not a rewrite of business logic.
 *
 * NOTE: this interface currently exists standalone. It is NOT yet wired into
 * payment-aggregator.tsx, which still calls each carrier's logic directly.
 * Wiring it in is a real refactor of that file and hasn't been done here —
 * see the accompanying issues doc.
 */

export interface TransactionRequest {
  idempotencyKey: string;
  amount: number;
  currency: 'TZS' | 'KES' | 'USD';
  phoneNumber: string;
  reference: string;
}

export interface TransactionResponse {
  success: boolean;
  transactionReference: string;
  errorMessage?: string;
  timestamp: string;
}

export interface IPaymentProvider {
  requestPayment(request: TransactionRequest): Promise<TransactionResponse>;
  refundPayment(transactionRef: string, amount: number): Promise<TransactionResponse>;
}
