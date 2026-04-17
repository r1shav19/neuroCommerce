export type ProductId = 'shoes' | 'bags' | 'watches' | 'caps' | 'jackets';

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  inventory: Record<ProductId, number>;
  demandScore: Record<ProductId, number>;
  authenticityScore: number;
  status: 'healthy' | 'low' | 'critical' | 'suspicious';
  agentKey: string; // for HMAC verification
}

export interface Decision {
  id: string;
  timestamp: number;
  fromStore: string;
  toStore: string;
  product: ProductId;
  units: number;
  reason: string;
  confidence: number;
  threatScore: number;
  eta: number; // minutes
  status: 'pending' | 'approved' | 'overridden';
  overrideReason?: string;
}

export interface AuctionBid {
  storeId: string;
  product: ProductId;
  urgencyScore: number;
  offerPrice: number;
  timestamp: number;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  eventType: 'decision' | 'threat' | 'transfer' | 'override' | 'bid';
  payload: object;
  hmacSignature: string;
}
