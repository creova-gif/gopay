import { IPaymentProvider, TransactionRequest, TransactionResponse } from './IPaymentProvider.ts';

/**
 * MockPaymentProvider
 *
 * A resilient sandbox implementation of the IPaymentProvider interface.
 * Simulates real-world East African mobile money network environments (M-Pesa, Airtel Money, Tigo Pesa)
 * including connection latencies, random cellular dropouts, and timeout behaviors.
 *
 * Used to fully validate transaction state machines and idempotency controls
 * safely before Bank of Tanzania (BoT) production licensing is secured.
 */
export class MockPaymentProvider implements IPaymentProvider {
  private networkLatencyMs: number;
  private connectionFailureRate: number; // Value between 0 and 1

  constructor(networkLatencyMs = 1500, connectionFailureRate = 0.15) {
    this.networkLatencyMs = networkLatencyMs;
    this.connectionFailureRate = connectionFailureRate;
  }

  /**
   * Helper to simulate network latency and connection reliability
   */
  private async simulateNetwork(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.networkLatencyMs));

    if (Math.random() < this.connectionFailureRate) {
      throw new Error("Network timeout: Carrier Gateway (M-Pesa/Airtel) did not respond in time.");
    }
  }

  /**
   * Requests a mobile money debit/C2B push (STK Push)
   */
  public async requestPayment(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      console.log(`[SANDBOX] Initiating Mobile Money Push to ${request.phoneNumber} for ${request.amount} ${request.currency}...`);

      // Simulate real-world carrier latency and network drops
      await this.simulateNetwork();

      // Enforce currency checks (TZS, KES, USD)
      if (!['TZS', 'KES', 'USD'].includes(request.currency)) {
        return {
          success: false,
          transactionReference: `ERR-${Date.now()}`,
          errorMessage: `Unsupported currency: ${request.currency}`,
          timestamp: new Date().toISOString()
        };
      }

      // Check for test number cases to simulate specific failure flows
      if (request.phoneNumber.endsWith("999")) {
        return {
          success: false,
          transactionReference: `ERR-${Date.now()}`,
          errorMessage: "Insufficient funds in subscriber wallet.",
          timestamp: new Date().toISOString()
        };
      }

      // Simulate a successful mobile money transaction
      const transactionReference = `TXN-SANDBOX-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      console.log(`[SANDBOX] Transaction successful. Reference: ${transactionReference}`);

      return {
        success: true,
        transactionReference,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error(`[SANDBOX NETWORK ERROR] Push payment failed for key ${request.idempotencyKey}: ${error.message}`);
      // Throwing the error simulates a true network failure, allowing the client
      // to test its retry logic and verify that the idempotency key prevents duplicate charges.
      throw error;
    }
  }

  /**
   * Simulates a transaction refund (B2C)
   */
  public async refundPayment(transactionRef: string, amount: number): Promise<TransactionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      transactionReference: `REF-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
  }
}
