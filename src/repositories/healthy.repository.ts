import { Inject, Service } from "typedi";
import { MongoDatabase } from "../database";

@Service("healthyRepository")
export class HealthyRepository {
  @Inject("mongoDatabase")
  private mongoClient!: MongoDatabase;

  async disconnectDatabase(client: MongoDatabase) {
    await client.disconnect();
  }

  async checkDatabase() {
    await this.mongoClient.connectToDatabase();
    const result = await this.mongoClient.checkDBConnection();

    await this.disconnectDatabase(this.mongoClient);

    return result;
  }
}
