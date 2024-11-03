import { Db, MongoClient, ServerApiVersion } from "mongodb";
import { IDatabase } from "../interfaces/database.interface";
import { Service, Container } from "typedi";

@Service("mongoDatabase")
export class MongoDatabase implements IDatabase {
  private URI = "";
  private client!: MongoClient;

  private async connect(
    db_user = process.env.DB_USER,
    db_pass = process.env.DB_PASS,
    db_host = process.env.DB_HOST,
    db_cluster = process.env.DB_CLUSTER
  ) {
    try {
      this.URI = `mongodb+srv://${db_user}:${db_pass}@${db_host}/?retryWrites=true&w=majority&appName=${db_cluster}`;

      this.client = new MongoClient(this.URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });

      return await this.client.connect();
    } catch (error) {
      process.stderr.write(`connection failed: ${JSON.stringify(error)}`);
      await this.client.close();
      throw Error(JSON.stringify(error));
    }
  }

  private async getDatabase(db_name = process.env.DB_NAME) {
    try {
      return await this.client.db(db_name);
    } catch (error) {
      process.stderr.write(
        `We got problem when try connect with database: ${JSON.stringify(
          error
        )}`
      );

      throw Error(JSON.stringify(error));
    }
  }

  private async checkDBConnection(db_name = process.env.DB_NAME) {
    try {
      const database = await this.getDatabase(db_name);

      await database.command({ ping: 1 }).then(() => {
        process.stdout.write(
          `${db_name} pinged. You successfully connected to MongoDB!`
        );
      });
    } catch (error) {
      process.stderr.write(
        `We got that error when try check database: ${JSON.stringify(error)}`
      );
      await this.client.close();
      throw Error(JSON.stringify(error));
    }
  }

  async disconnect() {
    try {
      await this.client.close();
    } catch (error) {
      process.stderr.write(
        `We got problem when try disconnect from database: ${JSON.stringify(
          error
        )}`
      );

      throw Error(JSON.stringify(error));
    }
  }

  async connectToDatabase() {
    try {
      await this.connect();

      // await this.checkDBConnection();

      return await this.getDatabase();
    } catch (error) {
      process.stderr.write(
        `error try connect database and check: ${JSON.stringify(error)}`
      );
      await this.client.close();
      throw Error(JSON.stringify(error));
    }
  }
}
