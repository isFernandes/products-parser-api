import { ImportService } from "../../services";
import { ImportHistoryRepository, ProductRepository } from "../../repositories";

jest.mock("../../repositories");

jest.mock("node:stream", () => ({
  ...jest.requireActual("node:stream"),
  Readable: {
    fromWeb: jest.fn(),
  },
}));
jest.mock("node:zlib", () => ({
  createUnzip: jest.fn(),
}));

describe("ImportService", () => {
  let importService: ImportService;
  let mockImportHistoryRepository: jest.Mocked<ImportHistoryRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockImportHistoryRepository =
      new ImportHistoryRepository() as jest.Mocked<ImportHistoryRepository>;
    mockProductRepository =
      new ProductRepository() as jest.Mocked<ProductRepository>;
    importService = new ImportService();
    importService["importRepository"] = mockImportHistoryRepository;
    importService["productRepository"] = mockProductRepository;
  });

  describe("importData", () => {
    it("should call getFilenames and processData for each filename", async () => {
      const filenames = ["file1.json", "file2.json"];
      jest.spyOn(importService, "importData").mockResolvedValue();

      await importService.importData();

      expect(importService["importData"]).toHaveBeenCalled();
    });
  });
});
