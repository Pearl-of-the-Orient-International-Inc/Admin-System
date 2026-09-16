export type ChaplainProductCategory =
  "PIN" | "PATCH" | "STICKER" | "ACCESSORY" | "APPAREL" | "OTHER";

export type ChaplainProductStockStatus =
  "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type ChaplainProductRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ChaplainProductCategory;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: ChaplainProductStockStatus;
  isAvailable: boolean;
  imageUrl: string;
  imageFileName: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ChaplainProductPayload = {
  slug: string;
  name: string;
  description?: string | null;
  category: ChaplainProductCategory;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  imageFileName?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type ChaplainProductListResponse = {
  code: string;
  message: string;
  data: ChaplainProductRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type ChaplainProductEnvelopeResponse = {
  code: string;
  message: string;
  data: ChaplainProductRecord;
};

export type UploadedChaplainProductImage = {
  key: string;
  name: string;
  size: number;
  ufsUrl: string;
  url: string;
  serverData: {
    userId: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
};
