import { Inject, Service } from "typedi";
import { MongoDatabase } from "../database";
import { IProduct, IProductStatus } from "../interfaces/product.interface";

@Service("productRepository")
export class ProductRepository {
  @Inject("mongoDatabase")
  private mongoClient!: MongoDatabase;

  private COLLECTION_NAME = "products";

  async disconnectDatabase(client: MongoDatabase) {
    await client.disconnect();
  }

  async findAll(pagination: { page: number; limit: number }) {
    const db = await this.mongoClient.connectToDatabase();

    const skip = (pagination.page - 1) * pagination.limit;

    const result = await db
      .collection<IProduct>(this.COLLECTION_NAME)
      .find()
      .skip(skip)
      .limit(pagination.limit)
      .toArray();

    return result;
  }

  async findByCode(code: string): Promise<IProduct | null> {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IProduct>(this.COLLECTION_NAME)
      .findOne({ code });

    return result;
  }

  async countProducts() {
    const db = await this.mongoClient.connectToDatabase();
    const result = db
      .collection<IProduct>(this.COLLECTION_NAME)
      .countDocuments();
    return result;
  }

  async save(productData: IProduct) {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IProduct>(this.COLLECTION_NAME)
      .insertOne({
        ...productData,
        imported_t: new Date() as Date,
        status: IProductStatus.DRAFT,
      });

    return result;
  }

  async saveMany(productData: IProduct[]) {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IProduct>(this.COLLECTION_NAME)
      .insertMany(productData);

    return result;
  }

  async update(
    code: string,
    updateData: Partial<IProduct>
  ): Promise<IProduct | null> {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IProduct>(this.COLLECTION_NAME)
      .findOneAndUpdate(
        { code },
        { $set: updateData },
        { returnDocument: "after" }
      );

    return result;
  }

  async delete(code: string): Promise<void> {
    const db = await this.mongoClient.connectToDatabase();

    await db
      .collection<IProduct>(this.COLLECTION_NAME)
      .findOneAndUpdate(
        { code },
        { $set: { status: IProductStatus.TRASH } },
        { returnDocument: "after" }
      );
  }
}
