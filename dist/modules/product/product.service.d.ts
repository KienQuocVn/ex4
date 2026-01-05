import type { ProductDatabase, ProductEntity, ProductListQuery } from "./product.database.js";
import type { ProductDoc } from "./product.model.js";
export declare class ProductService {
    private readonly productDb;
    constructor(productDb: ProductDatabase);
    private requireProductById;
    private assertSkuValid;
    private assertTitleValid;
    private assertPriceValid;
    create(input: Omit<ProductDoc, "createdAt" | "updatedAt">): Promise<ProductEntity>;
    updateById(productId: string, input: Partial<Omit<ProductDoc, "createdAt" | "updatedAt" | "_id">>): Promise<ProductEntity>;
    getById(productId: string): Promise<ProductEntity>;
    deleteById(productId: string): Promise<void>;
    list(query: ProductListQuery): Promise<ProductEntity[]>;
}
//# sourceMappingURL=product.service.d.ts.map