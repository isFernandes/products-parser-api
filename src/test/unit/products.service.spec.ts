import { ProductService } from "../../services";
import { ProductRepository } from "../../repositories";
import { IProduct } from "../../interfaces/product.interface";
import { HttpError } from "routing-controllers";

jest.mock("../../repositories");

describe("ProductService", () => {
  let productService: ProductService;
  let productRepository: ProductRepository;
  let mockProduct: Partial<IProduct>;

  beforeEach(() => {
    productRepository = new ProductRepository();
    productService = new ProductService();

    (productService as any).repository = productRepository;

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
      const mockProducts = [{ code: "P001" }];
      productRepository.findAll = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockProducts);
      expect(productRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("should throw an HttpError on failure", async () => {
      productRepository.findAll = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(
        productService.findAll({ page: 1, limit: 10 })
      ).rejects.toThrow(HttpError);
    });
  });

  describe("findByCode", () => {
    it("should return a product by code", async () => {
      const mockProduct: Partial<IProduct> = {
        code: "P001",
      };
      productRepository.findByCode = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.findByCode("P001");
      expect(result).toEqual(mockProduct);
      expect(productRepository.findByCode).toHaveBeenCalledWith("P001");
    });

    it("should throw an HttpError on failure", async () => {
      productRepository.findByCode = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(productService.findByCode("P001")).rejects.toThrow(
        HttpError
      );
    });
  });

  describe("save", () => {
    it("should save a product", async () => {
      productRepository.save = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.save(
        mockProduct as unknown as IProduct
      );
      expect(result).toEqual(mockProduct);
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it("should throw an HttpError on failure", async () => {
      productRepository.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(
        productService.save(mockProduct as unknown as IProduct)
      ).rejects.toThrow(HttpError);
    });
  });

  describe("saveMany", () => {
    it("should save multiple products", async () => {
      const mockProducts = [{ code: "P001" }];
      productRepository.saveMany = jest.fn().mockResolvedValue(mockProducts);

      const result = await productService.saveMany(
        mockProducts as unknown as IProduct[]
      );
      expect(result).toEqual(mockProducts);
      expect(productRepository.saveMany).toHaveBeenCalledWith(mockProducts);
    });

    it("should throw an HttpError on failure", async () => {
      const mockProducts = [mockProduct, mockProduct];
      productRepository.saveMany = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(
        productService.saveMany(mockProducts as unknown as IProduct[])
      ).rejects.toThrow(HttpError);
    });
  });

  describe("updateByCode", () => {
    it("should update a product by code", async () => {
      const mockProduct = { id: 1, code: "P001", name: "Updated Product" };
      productRepository.update = jest.fn().mockResolvedValue(mockProduct);

      const result = await productService.updateByCode(
        mockProduct.code as string,
        {
          ...mockProduct,
          creator: "isFernandes",
        }
      );
      expect(result).toEqual(mockProduct);
      expect(productRepository.update).toHaveBeenCalledWith(mockProduct.code, {
        ...mockProduct,
        creator: "isFernandes",
      });
    });

    it("should throw an HttpError on failure", async () => {
      productRepository.update = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(
        productService.updateByCode(mockProduct.code as string, {
          ...mockProduct,
          creator: "isFernandes",
        })
      ).rejects.toThrow(HttpError);
    });
  });

  describe("deleteByCode", () => {
    it("should delete a product by code", async () => {
      productRepository.delete = jest.fn().mockResolvedValue(undefined);

      await productService.deleteByCode("P001");
      expect(productRepository.delete).toHaveBeenCalledWith("P001");
    });

    it("should throw an HttpError on failure", async () => {
      productRepository.delete = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(productService.deleteByCode("P001")).rejects.toThrow(
        HttpError
      );
    });
  });
});
