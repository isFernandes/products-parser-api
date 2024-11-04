import { ImportHistoryRepository } from "../../repositories";
import { MongoDatabase } from "../../database";
import { IImportHistory } from "../../interfaces/import.interface";
import {
  MongoClient,
  Db,
  Collection,
  InsertOneResult,
  Document,
  ObjectId,
} from "mongodb";

jest.mock("../../database");

describe("ImportHistoryRepository", () => {
  let importHistoryRepository: ImportHistoryRepository;
  let mockMongoDatabase: jest.Mocked<MongoDatabase>;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection<Document>>;

  beforeEach(() => {
    mockMongoDatabase = new MongoDatabase() as jest.Mocked<MongoDatabase>;
    mockDb = {
      collection: jest.fn(),
    } as unknown as jest.Mocked<Db>;

    mockCollection = {
      find: jest.fn(),
      toArray: jest.fn(),
      insertOne: jest.fn(),
    } as unknown as jest.Mocked<Collection<Document>>;

    mockMongoDatabase.connectToDatabase = jest.fn().mockResolvedValue(mockDb);
    mockDb.collection.mockReturnValue(mockCollection);

    importHistoryRepository = new ImportHistoryRepository();
    importHistoryRepository["mongoClient"] = mockMongoDatabase;
  });

  describe("disconnectDatabase", () => {
    it("should disconnect the database", async () => {
      mockMongoDatabase.disconnect = jest.fn();

      await importHistoryRepository.disconnectDatabase(mockMongoDatabase);

      expect(mockMongoDatabase.disconnect).toHaveBeenCalled();
    });
  });

  describe("getLastUpdate", () => {
    it("should retrieve the latest import history entry", async () => {
      const mockHistory: IImportHistory = {
        date: new Date("2023-01-01"),
        quantity: 100,
        source: "testSource.json",
      };

      mockCollection.find.mockResolvedValue(
        mockHistory.date as unknown as never
      );

      const result = await importHistoryRepository.getLastUpdate();

      expect(mockMongoDatabase.connectToDatabase).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("importHistory");
      expect(mockCollection.find).toHaveBeenCalledWith(
        {},
        { sort: { date: -1 }, limit: 1 }
      );
      expect(result).toEqual(mockHistory);
    });
  });

  describe("save", () => {
    it("should save a new import history entry", async () => {
      const mockHistory: IImportHistory = {
        date: new Date("2023-01-01"),
        quantity: 100,
        source: "testSource.json",
        offset: 0,
      };

      const mockInsertResult: InsertOneResult<IImportHistory> = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await importHistoryRepository.save(mockHistory);

      expect(mockMongoDatabase.connectToDatabase).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("importHistory");
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockHistory);
      expect(result).toEqual(mockInsertResult);
    });
  });
});
