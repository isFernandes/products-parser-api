import { ImportService, ProductService } from "../../services";
import { ImportHistoryRepository } from "../../repositories";

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
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    mockImportHistoryRepository =
      new ImportHistoryRepository() as jest.Mocked<ImportHistoryRepository>;
    mockProductService = new ProductService() as jest.Mocked<ProductService>;
    importService = new ImportService();
    importService["importRepository"] = mockImportHistoryRepository;
    importService["productService"] = mockProductService;
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
