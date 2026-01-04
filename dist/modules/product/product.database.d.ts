export type ProductListQuery = {
    q?: string;
    category?: string;
    tags?: string[];
    status?: "active" | "inactive";
    minPrice?: number;
    maxPrice?: number;
    sort?: "newest" | "price_asc" | "price_desc";
    page: number;
    limit: number;
};
export declare class ProductDatabase {
    private col;
    create(): Promise<void>;
    updatedById(): Promise<void>;
    findById(): Promise<void>;
    deletedById(): Promise<void>;
    list(): Promise<void>;
}
//# sourceMappingURL=product.database.d.ts.map