import { ApiError } from "../../utils/http.js";
import type { ProductDatabase, ProductEntity, ProductListQuery } from "./product.database.js";
import type { ProductDoc, ProductStatus } from "./product.model.js";

export class ProductService {
  constructor(private readonly productDb: ProductDatabase) {}

  private async requireProductById(productId: string): Promise<ProductEntity> {
    const product = await this.productDb.findById(productId);
    if (!product) {
      throw new ApiError(404, { message: "Product not found" });
    }
    return product;
  }

  private assertSkuValid(sku: string): void {
    if (!sku || sku.trim().length === 0) {
      throw new ApiError(400, { message: "SKU is required" });
    }
  }

  private assertTitleValid(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new ApiError(400, { message: "Title is required" });
    }
  }

  private assertPriceValid(price: number): void {
    if (price === undefined || price === null) {
      throw new ApiError(400, { message: "Price is required" });
    }
    if (price < 0) {
      throw new ApiError(400, { message: "Price must be non-negative" });
    }
  }

  async create(input: Omit<ProductDoc, "createdAt" | "updatedAt">): Promise<ProductEntity> {
    this.assertSkuValid(input.sku);
    this.assertTitleValid(input.title);
    this.assertPriceValid(input.price);

    const now = new Date();
    return this.productDb.create({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateById(
    productId: string,
    input: Partial<Omit<ProductDoc, "createdAt" | "updatedAt" | "_id">>
  ): Promise<ProductEntity> {
    await this.requireProductById(productId);

    if (input.sku !== undefined) {
      this.assertSkuValid(input.sku);
    }
    if (input.title !== undefined) {
      this.assertTitleValid(input.title);
    }
    if (input.price !== undefined) {
      this.assertPriceValid(input.price);
    }

    const now = new Date();
    const updated = await this.productDb.updateById(productId, {
      ...input,
      updatedAt: now,
    });

    if (!updated) {
      throw new ApiError(404, { message: "Product not found" });
    }

    return updated;
  }

  async getById(productId: string): Promise<ProductEntity> {
    return this.requireProductById(productId);
  }

  async deleteById(productId: string): Promise<void> {
    await this.requireProductById(productId);
    const deleted = await this.productDb.deleteById(productId);
    if (!deleted) {
      throw new ApiError(404, { message: "Product not found" });
    }
  }

  async list(query: ProductListQuery): Promise<ProductEntity[]> {
    // Validate pagination
    if (query.page < 1) {
      throw new ApiError(400, { message: "Page must be at least 1" });
    }
    if (query.limit < 1 || query.limit > 100) {
      throw new ApiError(400, { message: "Limit must be between 1 and 100" });
    }

    return this.productDb.list(query);
  }
}

