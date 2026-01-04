export type ProductStatus = "active" | "inactive";

export type ProductDoc = {
  sku: string;

  title: string;
  description: string;

  price: number;
  currency: "USD" | "VND";

  category: string;
  tags: string[];

  status: ProductStatus;

  createdAt: Date;
  updatedAt: Date;
};
