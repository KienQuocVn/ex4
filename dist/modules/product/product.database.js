import { ObjectId } from "mongodb";
import { getDb } from "../../database/mongo.js";
export class ProductDatabase {
    col() {
        return getDb().collection("products");
    }
    async create(doc) {
        const res = await this.col().insertOne(doc);
        return { ...doc, _id: res.insertedId };
    }
    async updateById(id, set) {
        return this.col().findOneAndUpdate({ _id: new ObjectId(id) }, { $set: set }, { returnDocument: "after" });
    }
    async findById(id) {
        return this.col().findOne({
            _id: new ObjectId(id),
        });
    }
    async deleteById(id) {
        const res = await this.col().deleteOne({ _id: new ObjectId(id) });
        return res.deletedCount === 1;
    }
    async list(query) {
        const filter = {};
        // Text search
        if (query.q) {
            filter.$or = [
                { title: { $regex: query.q, $options: "i" } },
                { description: { $regex: query.q, $options: "i" } },
                { sku: { $regex: query.q, $options: "i" } },
            ];
        }
        // Category filter
        if (query.category) {
            filter.category = query.category;
        }
        // Tags filter
        if (query.tags && query.tags.length > 0) {
            filter.tags = { $in: query.tags };
        }
        // Status filter
        if (query.status) {
            filter.status = query.status;
        }
        // Price range filter
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            filter.price = {};
            if (query.minPrice !== undefined) {
                filter.price.$gte = query.minPrice;
            }
            if (query.maxPrice !== undefined) {
                filter.price.$lte = query.maxPrice;
            }
        }
        // Sort
        let sort = {};
        switch (query.sort) {
            case "price_asc":
                sort = { price: 1, createdAt: -1 };
                break;
            case "price_desc":
                sort = { price: -1, createdAt: -1 };
                break;
            case "newest":
            default:
                sort = { createdAt: -1 };
        }
        // Pagination
        const skip = (query.page - 1) * query.limit;
        return this.col()
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(query.limit)
            .toArray();
    }
}
//# sourceMappingURL=product.database.js.map