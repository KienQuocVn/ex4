import { getDb } from "../../database/mongo.js";
export class ProductDatabase {
    col() {
        return getDb().collection("products");
    }
    async create() { } // role admin
    async updatedById() { } // role admin
    async findById() { } // role any
    async deletedById() { } // role admin
    async list() { } // role any
}
//# sourceMappingURL=product.database.js.map