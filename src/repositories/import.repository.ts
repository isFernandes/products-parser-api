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

  async getLastUpdate() {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .find(
        {},
        {
          sort: { date: -1 },
          limit: 1,
        }
      )
      .toArray();

    return result;
  }

  async getLastOffset(filename: string) {
    const db = await this.mongoClient.connectToDatabase();
    const result = await db
      .collection<IImportHistory>(this.COLLECTION_NAME)
      .findOne(
        { source: filename },
        {
          sort: { date: -1 },
        }
      );

    return result?.offset;
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
}
