import type { Request, Response } from "express";
import { ok } from "../../utils/http.js";
import type { ProductListQuery } from "./product.database.js";
import type { ProductService } from "./product.service.js";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  private toProductDto(product: any) {
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

  list = async (req: Request, res: Response) => {
    const {
      q,
      category,
      tags,
      status,
      minPrice,
      maxPrice,
      sort,
      page = "1",
      limit = "10",
    } = req.query;

    const query: ProductListQuery = {
      page: Number(page),
      limit: Number(limit),
    };

    if (q) query.q = q as string;
    if (category) query.category = category as string;
    if (tags) {
      query.tags = Array.isArray(tags) ? (tags as string[]) : [tags as string];
    }
    if (status) query.status = status as "active" | "inactive";
    if (minPrice) query.minPrice = Number(minPrice);
    if (maxPrice) query.maxPrice = Number(maxPrice);
    if (sort) query.sort = sort as "newest" | "price_asc" | "price_desc";

    const products = await this.productService.list(query);
    res.json(ok(products.map((p) => this.toProductDto(p))));
  };

  getById = async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = await this.productService.getById(productId!);
    res.json(ok(this.toProductDto(product)));
  };

  create = async (req: Request, res: Response) => {
    const {
      sku,
      title,
      description,
      price,
      currency,
      category,
      tags,
      status,
    } = req.body;

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

  update = async (req: Request, res: Response) => {
    const productId = req.params.id;
    const {
      sku,
      title,
      description,
      price,
      currency,
      category,
      tags,
      status,
    } = req.body;

    const updateData: any = {};
    if (sku !== undefined) updateData.sku = sku;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;

    const product = await this.productService.updateById(productId!, updateData);
    res.json(ok(this.toProductDto(product)));
  };

  delete = async (req: Request, res: Response) => {
    const productId = req.params.id;
    await this.productService.deleteById(productId!);
    res.status(204).send();
  };
}

