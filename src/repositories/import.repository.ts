// src/repositories/ProductRepository.ts

import { Inject, Service } from "typedi";
import { MongoDatabase } from "../database";
import { IImportHistory } from "../interfaces/import.interface";

@Service("importHistoryRepository")
export class ImportHistoryRepository {
  @Inject("mongoDatabase")
  private mongoClient!: MongoDatabase;

  private COLLECTION_NAME = "importHistory";

  async disconnectDatabase(client: MongoDatabase) {
    await client.disconnect();
  }

  async findAll() {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .find()
      .toArray();

    console.log(result);

    return result;
  }

  async findByCode(code: number): Promise<IImportHistory | null> {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .findOne({ code });

    return result;
  }

  async save(importData: IImportHistory) {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .insertOne({
        ...importData,
      });

    return result;
  }

  async updateByCode(
    code: number,
    updateData: Partial<IImportHistory>
  ): Promise<IImportHistory | null> {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .findOneAndUpdate(
        { code },
        { $set: updateData },
        { returnDocument: "after" }
      );

    return result;
  }

  async deleteByCode(code: number): Promise<void> {
    const db = await this.mongoClient.connectToDatabase();

    await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .deleteOne({ code });
  }
}
