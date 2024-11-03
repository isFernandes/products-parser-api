import { Inject, Service } from "typedi";
import { ProductRepository } from "../repositories";
import { IProduct } from "../interfaces/product.interface";
import { HttpError } from "routing-controllers";

@Service("productService")
export class ProductService {
  @Inject("productRepository")
  private repository!: ProductRepository;

  async findAll({ page = 1, limit = 10 }: { page: number; limit: number }) {
    try {
      return await this.repository.findAll({ page, limit });
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  async findByCode(code: string): Promise<IProduct | null> {
    try {
      return await this.repository.findByCode(code);
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  async save(productData: IProduct) {
    try {
      return await this.repository.save(productData);
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  async saveMany(productData: IProduct[]) {
    try {
      return await this.repository.saveMany(productData);
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  async updateByCode(
    code: string,
    updateData: Partial<IProduct>
  ): Promise<IProduct | null> {
    try {
      return await this.repository.update(code, updateData);
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  async deleteByCode(code: string): Promise<void> {
    try {
      return await this.repository.delete(code);
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }
}
