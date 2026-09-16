export type ChaplainOrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type ChaplainProductOrder = {
  id: string;
  orderNumber: string;
  productId: string;
  product: { id: string; name: string; slug: string; imageUrl: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  platformFee: number;
  total: number;
  customerUser: { id: string; name: string; email: string } | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  deliveryAddress: string | null;
  customerNotes: string | null;
  paymentMethod: "CASH" | "ONLINE";
  paymentStatus:
    "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
  paymentGateway: string | null;
  providerCheckoutId: string | null;
  providerCheckoutUrl: string | null;
  latestPayment: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    purpose: string;
    gateway: "XENDIT" | "PAYPAL";
    gatewayReference: string | null;
    status:
      "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
    providerStatus: string | null;
    failureReason: string | null;
    paidAt: string | null;
    expiresAt: string | null;
    createdAt: string;
  } | null;
  status: ChaplainOrderStatus;
  inventoryReleasedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChaplainProductOrderListResponse = {
  code: string;
  message: string;
  data: ChaplainProductOrder[];
};

export type ChaplainProductOrderResponse = {
  code: string;
  message: string;
  data: ChaplainProductOrder;
};
