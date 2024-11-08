import { Inject, Service } from "typedi";
import { Readable, Transform } from "node:stream";
import { createUnzip, constants } from "node:zlib";

import { IProduct, IProductStatus } from "../interfaces/product.interface";
import { ImportHistoryRepository, ProductRepository } from "../repositories";
import { HttpError } from "routing-controllers";
import { emitEventStream } from "../events/import.events";

@Service("importService")
export class ImportService {
  @Inject("importHistoryRepository")
  private importRepository!: ImportHistoryRepository;

  @Inject("productRepository")
  private productRepository!: ProductRepository;

  async importData() {
    try {
      const names = await this.getFilenames();

      for await (const name of names) {
        if (name.length === 19) await this.processData(name);
      }
    } catch (error) {
      console.error(error);
    }
  }

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
        const newData = this.sanitizeData(data.toString());
        filenames.push(...newData);
      });

      stream.on("end", () => {
        resolve();
      });
    });
  }

  private sanitizeData(data: string): string[] {
    return data.split("\n").filter((el: string) => el.length > 1);
  }

  private async processData(filename: string) {
    const returnedData = await this.callApi(
      `https://challenges.coode.sh/food/data/json/${filename}`
    );

    let fileOffset: number = await this.getOffset(filename);

    const dataToStream = Readable.fromWeb(returnedData);

    const products: IProduct[] = [];

    dataToStream
      .pipe(createUnzip({ finishFlush: constants.Z_SYNC_FLUSH }))
      .pipe(this.limitOffset(fileOffset))
      .pipe(this.extractProductLine())
      .pipe(this.parseProductObject())
      .on("data", async ({ payload, newOffset }) => {
        products.push(payload);
        fileOffset = newOffset > fileOffset ? newOffset : fileOffset;
      })
      .on("finish", async () => {
        if (products.length > 0) {
          await this.importRepository.save({
            quantity: products.length,
            date: new Date(),
            source: filename,
            offset: fileOffset,
          });

          await this.productRepository.saveMany(products);
        }
      });

    return dataToStream;
  }

  private async getOffset(filename: string) {
    try {
      const offset = await this.importRepository.getLastOffset(filename);
      return offset || 0;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  private limitOffset(fileOffset: number) {
    return new Transform({
      transform(chunk, _, callback) {
        const buffer = Buffer.from(chunk);

        if (fileOffset > 0) {
          if (buffer.length <= fileOffset) {
            fileOffset -= buffer.length;
            return callback();
          } else {
            const start = fileOffset;
            const end = buffer.length;

            fileOffset = 0;

            this.push(buffer.subarray(start, end));
          }
        } else {
          this.push(buffer);
        }
        callback();
      },
    });
  }

  private extractProductLine() {
    let buffer = "";
    let bufferSize = 0;
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
          try {
            const extractedProduct = buffer.slice(0, lineManager);
            buffer = buffer.slice(lineManager + 1);

            bufferSize +=
              Buffer.byteLength(extractedProduct.toString(), "utf8") + 1;
            const transformedProduct = JSON.parse(extractedProduct.toString());
            this.push(
              JSON.stringify({
                ...transformedProduct,
                count: productsCount,
                newOffset: bufferSize,
              })
            );
            productsCount++;
          } catch (error) {
            emitEventStream.emit("import:error", error);
          }
        }
        callback();
      },
    });
  }

  private parseProductObject() {
    return new Transform({
      objectMode: true,
      transform(chunk, _, callback) {
        const productData = JSON.parse(chunk.toString());
        const sanitizedProduct = {
          code: productData.code.replace(/\D/g, "").toString(),
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

        this.emit("data", {
          payload: sanitizedProduct,
          productCount: productData.count,
          newOffset: productData.newOffset,
        });

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
}
