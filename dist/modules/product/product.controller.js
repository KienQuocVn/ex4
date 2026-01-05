import { ok } from "../../utils/http.js";
export class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    toProductDto(product) {
        return {
            id: product._id.toString(),
            sku: product.sku,
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            category: product.category,
            tags: product.tags,
            status: product.status,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
    list = async (req, res) => {
        const { q, category, tags, status, minPrice, maxPrice, sort, page = "1", limit = "10", } = req.query;
        const query = {
            page: Number(page),
            limit: Number(limit),
        };
        if (q && typeof q === "string")
            query.q = q;
        if (category && typeof category === "string")
            query.category = category;
        if (tags) {
            query.tags = Array.isArray(tags) ? tags : [tags];
        }
        if (status && (status === "active" || status === "inactive")) {
            query.status = status;
        }
        if (minPrice !== undefined && minPrice !== "") {
            const minPriceNum = Number(minPrice);
            if (!isNaN(minPriceNum))
                query.minPrice = minPriceNum;
        }
        if (maxPrice !== undefined && maxPrice !== "") {
            const maxPriceNum = Number(maxPrice);
            if (!isNaN(maxPriceNum))
                query.maxPrice = maxPriceNum;
        }
        if (sort && (sort === "newest" || sort === "price_asc" || sort === "price_desc")) {
            query.sort = sort;
        }
        const products = await this.productService.list(query);
        res.json(ok(products.map((p) => this.toProductDto(p))));
    };
    getById = async (req, res) => {
        const productId = req.params.id;
        const product = await this.productService.getById(productId);
        res.json(ok(this.toProductDto(product)));
    };
    create = async (req, res) => {
        const { sku, title, description, price, currency, category, tags, status, } = req.body;
        const product = await this.productService.create({
            sku,
            title,
            description: description || "",
            price,
            currency: currency || "USD",
            category: category || "",
            tags: tags || [],
            status: status || "active",
        });
        res.status(201).json(ok(this.toProductDto(product)));
    };
    update = async (req, res) => {
        const productId = req.params.id;
        const { sku, title, description, price, currency, category, tags, status, } = req.body;
        const updateData = {};
        if (sku !== undefined)
            updateData.sku = sku;
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (price !== undefined)
            updateData.price = price;
        if (currency !== undefined)
            updateData.currency = currency;
        if (category !== undefined)
            updateData.category = category;
        if (tags !== undefined)
            updateData.tags = tags;
        if (status !== undefined)
            updateData.status = status;
        const product = await this.productService.updateById(productId, updateData);
        res.json(ok(this.toProductDto(product)));
    };
    delete = async (req, res) => {
        const productId = req.params.id;
        await this.productService.deleteById(productId);
        res.status(204).send();
    };
}
//# sourceMappingURL=product.controller.js.map