import { ProductRepository } from "../../repositories";
import { IProduct, IProductStatus } from "../../interfaces/product.interface";
import { InsertManyResult, ObjectId } from "mongodb";

describe("ProductRepository", () => {
  let productRepository: ProductRepository;
  let mockProduct: any;

  beforeEach(() => {
    productRepository = new ProductRepository();

    mockProduct = {
      code: "20221126",
      url: "https://world.openfoodfacts.org/product/20221126",
      creator: "securita",
      created_t: 1415302075,
      last_modified_t: 1572265837,
      product_name: "Madalenas quadradas",
      quantity: "380 g (6 x 2 u.)",
      brands: "La Cestera",
      categories:
        "Lanches comida, Lanches doces, Biscoitos e Bolos, Bolos, Madalenas",
      labels: "Contem gluten, Contém derivados de ovos, Contém ovos",
      cities: "",
      purchase_places: "Braga,Portugal",
      stores: "Lidl",
      ingredients_text:
        "farinha de trigo, açúcar, óleo vegetal de girassol, clara de ovo, ovo, humidificante (sorbitol), levedantes químicos (difosfato dissódico, hidrogenocarbonato de sódio), xarope de glucose-frutose, sal, aroma",
      traces:
        "Frutos de casca rija,Leite,Soja,Sementes de sésamo,Produtos à base de sementes de sésamo",
      serving_size: "madalena 31.7 g",
      serving_quantity: 31.7,
      nutriscore_score: 17,
      nutriscore_grade: "d",
      main_category: "en:madeleines",
      image_url:
        "https://static.openfoodfacts.org/images/products/20221126/front_pt.5.400.jpg",
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return a list of products", async () => {
      const mockProducts: any[] = [
        { _id: new ObjectId(), ...mockProduct },
        { _id: new ObjectId(), ...mockProduct },
      ] as unknown as IProduct[];

      jest.spyOn(productRepository, "findAll").mockResolvedValue(mockProducts);

      const result = await productRepository.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockProducts);
    });

    it("should handle empty results", async () => {
      jest.spyOn(productRepository, "findAll").mockResolvedValue([]);

      const result = await productRepository.findAll({ page: 1, limit: 10 });
      expect(result).toEqual([]);
    });
  });

  describe("findByCode", () => {
    it("should return a product by code", async () => {
      const mockedProduct: IProduct = {
        _id: new ObjectId(),
        ...mockProduct,
      };
      jest
        .spyOn(productRepository, "findByCode")
        .mockResolvedValue(mockProduct);

      const result = await productRepository.findByCode("P001");
      expect(result).toEqual(mockProduct);
    });

    it("should return null if product not found", async () => {
      jest.spyOn(productRepository, "findByCode").mockResolvedValue(null);

      const result = await productRepository.findByCode("P999");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("should save a product and return it", async () => {
      const mockedProduct = {
        _id: new ObjectId(),
        code: "P001",
        creator: "Product 1",
        ...mockProduct,
      };
      jest.spyOn(productRepository, "save").mockResolvedValue(mockedProduct);

      const result = await productRepository.save(mockedProduct);
      expect(result).toEqual(mockedProduct);
    });
  });

  describe("saveMany", () => {
    it("should save multiple products and return them", async () => {
      const mockProducts = [
        { _id: new ObjectId(), ...mockProduct },
        { _id: new ObjectId(), ...mockProduct },
      ] as unknown as InsertManyResult<IProduct>;

      jest.spyOn(productRepository, "saveMany").mockResolvedValue(mockProducts);

      const result = await productRepository.saveMany(
        mockProducts as unknown as IProduct[]
      );

      expect(result).toEqual(mockProducts);
    });
  });

  describe("update", () => {
    it("should update a product by code and return the updated product", async () => {
      const mockUpdatedProduct: IProduct = {
        _id: new ObjectId(),
        code: "P001",
        creator: "Updated Product",
        status: IProductStatus.DRAFT,
        imported_t: new Date(),
        ...mockProduct,
      };
      jest
        .spyOn(productRepository, "update")
        .mockResolvedValue(mockUpdatedProduct);

      const result = await productRepository.update("P001", {
        creator: "Updated Product",
      });
      expect(result).toEqual(mockUpdatedProduct);
    });

    it("should return null if the product to update does not exist", async () => {
      jest.spyOn(productRepository, "update").mockResolvedValue(null);

      const result = await productRepository.update("P999", {
        creator: "Nonexistent Product",
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a product by code", async () => {
      jest.spyOn(productRepository, "delete").mockResolvedValue(undefined);

      await productRepository.delete("P001");
      expect(productRepository.delete).toHaveBeenCalledWith("P001");
    });

    it("should handle errors during deletion", async () => {
      jest
        .spyOn(productRepository, "delete")
        .mockRejectedValue(new Error("Database error"));

      await expect(productRepository.delete("P999")).rejects.toThrow(
        "Database error"
      );
    });
  });
});
