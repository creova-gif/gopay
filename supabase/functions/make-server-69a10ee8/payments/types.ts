export type Network = 'mpesa' | 'tigo' | 'airtel' | 'halopesa' | 'card';
export type TxType = 'topup' | 'withdrawal' | 'p2p_send';
export type TxStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';

export interface PaymentRequest {
  userId: string;
  type: TxType;
  network: Network;
  amount: number;
  currency: 'TZS';
  phone: string;
  reference: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  providerRef: string;
  status: TxStatus;
  message: string;
  demo?: boolean;
}

export interface WebhookEvent {
  providerRef: string;
  status: TxStatus;
  rawBody: string;
}
