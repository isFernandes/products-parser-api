import { Db, Document, MongoClient } from "mongodb";

export interface IDatabase {
  connectToDatabase: () => Promise<Db>;
  checkDBConnection: () => Promise<Document>;
  disconnect: () => void;
}
