import { MongoClient } from "mongodb";

export interface IDatabase {
  // connect: (db_name: string) => Promise<MongoClient | undefined>;
  disconnect: () => void;
}
