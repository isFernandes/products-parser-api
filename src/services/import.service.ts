import { Inject, Service } from "typedi";
import { Readable, Transform } from "node:stream";
import { createUnzip } from "node:zlib";

import { IProduct, IProductStatus } from "../interfaces/product.interface";
import { ImportHistoryRepository } from "../repositories";
import { HttpError } from "routing-controllers";
import { ProductService } from "./products.service";

@Service("importService")
export class ImportService {
  @Inject("importHistoryRepository")
  private importRepository!: ImportHistoryRepository;

  @Inject("productService")
  private productService!: ProductService;

  private async getFilenames() {
    const filenames: string[] = [];

    const returnedData = await this.callApi(
      "https://challenges.coode.sh/food/data/json/index.txt"
    );
    const dataToStream = Readable.fromWeb(returnedData);

    await this.resolveStreamFilename(dataToStream, filenames);

    return filenames;
  }

  private async callApi(uri: string) {
    const { body, ok } = await fetch(uri, {
      method: "GET",
    });

    if (!body || !ok) {
      throw new HttpError(404, "No existing data to read");
    }

    return body;
  }

  private async resolveStreamFilename(stream: Readable, filenames: string[]) {
    await new Promise<void>((resolve) => {
      stream.on("data", (data) => {
        const sanitizedData = this.sanitizeData(data.toString());
        filenames.push(...sanitizedData);
      });

      stream.on("end", () => {
        resolve();
      });
    });
  }

  private sanitizeData(data: string): string[] {
    return data.split("\n").filter((el: string) => el.length > 1);
  }

  async importData() {
    try {
      const names = await this.getFilenames();

      for await (const name of names) {
        await this.processData(name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private parseProductObject() {
    return new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const productData = JSON.parse(chunk.toString());
        const sanitizedProduct = {
          code: productData.code,
          url: productData.url,
          creator: productData.creator,
          created_t: productData.created_t,
          last_modified_t: productData.last_modified_t,
          product_name: productData.product_name,
          quantity: productData.quantity,
          brands: productData.brands,
          categories: productData.categories,
          labels: productData.labels,
          cities: productData.cities,
          purchase_places: productData.purchase_places,
          stores: productData.stores,
          ingredients_text: productData.ingredients_text,
          traces: productData.traces,
          serving_size: productData.serving_size,
          serving_quantity: productData.serving_quantity,
          nutriscore_score: productData.nutriscore_score,
          nutriscore_grade: productData.nutriscore_grade,
          main_category: productData.main_category,
          image_url: productData.image_url,
          imported_t: new Date() as Date,
          status: IProductStatus.DRAFT,
        };

        this.emit("data", sanitizedProduct);

        callback();
      },
    });
  }

  private extractProductLine() {
    let buffer = "";
    let productsCount = 0;
    const MAX_PRODUCTS = Number(process.env.MAX_PRODUCTS_EXTRACT) || 100;

    return new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        buffer += chunk.toString();

        let lineManager;

        if (productsCount >= MAX_PRODUCTS) {
          this.end();
        }

        while (
          (lineManager = buffer.indexOf("\n")) >= 0 &&
          productsCount < MAX_PRODUCTS
        ) {
          const extractedProduct = buffer.slice(0, lineManager);
          buffer = buffer.slice(lineManager + 1);

          try {
            this.push(extractedProduct);
            productsCount++;
          } catch (error) {
            console.error("Erro ao processar JSON:", error);
          }
        }
        callback();
      },
    });
  }

  async getLastImport() {
    try {
      return await this.importRepository.getLastUpdate();
    } catch (error) {
      throw new HttpError(500, error as string);
    }
  }

  private async processData(filename: string) {
    const returnedData = await this.callApi(
      `https://challenges.coode.sh/food/data/json/${filename}`
    );

    const dataToStream = Readable.fromWeb(returnedData);

    const products: IProduct[] = [];

    dataToStream
      .pipe(createUnzip())
      .pipe(this.extractProductLine())
      .pipe(this.parseProductObject())
      .on("data", async (data) => {
        products.push(data);
      })
      .on("finish", async () => {
        await this.importRepository.save({
          quantity: products.length,
          date: new Date(),
          source: filename,
        });

        await this.productService.saveMany(products);
      });

    return dataToStream;
  }
}
