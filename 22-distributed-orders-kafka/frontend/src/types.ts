export interface LogEntry {
  service: string;
  level: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  orderId?: string;
  operation?: string;
  [key: string]: unknown;
}

export interface WaterfallEntry {
  spanId: string;
  parentSpanId: string | null;
  name: string;
  service: string;
  kind: string;
  status: string;
  offsetMs: number;
  durationMs: number;
  depth: number;
}

export interface TraceView {
  traceId: string;
  totalDurationMs: number;
  spanCount: number;
  status: string;
  waterfall: WaterfallEntry[];
}

export interface Product {
  sku: string;
  name: string;
  price: number;
  emoji: string;
  note?: string;
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface OrderResult {
  ok?: boolean;
  correlationId?: string;
  order?: { id: string; status: string; total: number };
  error?: string;
}
