import "reflect-metadata";
import { ProductController } from "../../controllers/product.controller";
import { ProductService } from "../../services";
import { Container } from "typedi";
import { IProduct, IProductStatus } from "../../interfaces/product.interface";
import { ObjectId } from "mongodb";

describe("ProductController", () => {
  let controller: ProductController;
  let mockProductService: jest.Mocked<ProductService>;
  let mockResponse: any;
  let mockProduct: IProduct;

  beforeEach(() => {
    mockProductService = {
      findByCode: jest.fn(),
      updateByCode: jest.fn(),
      deleteByCode: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockProduct = {
      _id: new ObjectId(),
      status: IProductStatus.DRAFT,
      imported_t: new Date(),
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

    mockResponse = {
      status: 200,
    };

    Container.set("productService", mockProductService);
    controller = new ProductController();
    controller.service = mockProductService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("update", () => {
    it("should successfully update a product", async () => {
      const updateData = { creator: "Updated Product" };
      const updatedProduct = { ...mockProduct, ...updateData };

      mockProductService.findByCode.mockResolvedValue(updatedProduct);
      mockProductService.updateByCode.mockResolvedValue(updatedProduct);

      const result = await controller.update(
        mockProduct.code,
        updateData,
        mockResponse
      );

      expect(result).toEqual({
        statusCode: 200,
        message: "Product updated",
        data: updatedProduct,
      });
      expect(mockProductService.findByCode).toHaveBeenCalledWith(
        mockProduct.code
      );
      expect(mockProductService.updateByCode).toHaveBeenCalledWith(
        mockProduct.code,
        updateData
      );
    });

    it("should throw error when product not found", async () => {
      const code = "nonexistent";
      mockProductService.findByCode.mockResolvedValue(null);

      await expect(controller.update(code, {}, mockResponse)).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("delete", () => {
    it("should successfully delete a product", async () => {
      mockProductService.findByCode.mockResolvedValue({ ...mockProduct });

      const result = await controller.delete(mockProduct.code, mockResponse);

      expect(result).toEqual({
        statusCode: 200,
        message: "Product deleted",
      });
      expect(mockProductService.deleteByCode).toHaveBeenCalledWith(
        mockProduct.code
      );
    });

    it("should throw error when product not found", async () => {
      const code = "nonexistent";
      mockProductService.findByCode.mockResolvedValue(null);

      await expect(controller.delete(code, mockResponse)).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("getOneByCode", () => {
    it("should successfully get a product by code", async () => {
      mockProductService.findByCode.mockResolvedValue({ ...mockProduct });

      const result = await controller.getOneByCode(
        mockProduct.code,
        mockResponse
      );

      expect(result).toEqual({
        statusCode: 200,
        message: "Product founded",
        data: mockProduct,
      });
      expect(mockProductService.findByCode).toHaveBeenCalledWith(
        mockProduct.code
      );
    });

    it("should return null when product not found", async () => {
      const code = "nonexistent";
      mockProductService.findByCode.mockResolvedValue(null);

      const result = await controller.getOneByCode(code, mockResponse);

      expect(result).toEqual({
        statusCode: 200,
        message: "Product founded",
        data: null,
      });
    });
  });

  describe("getRole", () => {
    it("should successfully get all products with pagination", async () => {
      const filter = { page: 1, limit: 10 };
      const products = [
        { _id: new ObjectId(), ...mockProduct },
        { _id: new ObjectId(), ...mockProduct },
      ];
      mockProductService.findAll.mockResolvedValue(products);

      const result = await controller.getAll(1, 10, mockResponse);

      expect(result).toEqual({
        statusCode: 200,
        message: "Products founded",
        ...filter,
        data: products,
      });
      expect(mockProductService.findAll).toHaveBeenCalledWith(filter);
    });

    it("should return empty array when no products found", async () => {
      const filter = { page: 1, limit: 10 };
      mockProductService.findAll.mockResolvedValue([]);

      const result = await controller.getAll(1, 10, mockResponse);

      expect(result).toEqual({
        statusCode: 200,
        message: "Products founded",
        ...filter,
        data: [],
      });
    });
  });
});
