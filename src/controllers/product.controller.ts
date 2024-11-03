import {
  JsonController,
  Get,
  Delete,
  Put,
  Param,
  Body,
  QueryParams,
  Res,
  HttpCode,
} from "routing-controllers";
import { Inject, Service } from "typedi";
import { ProductService } from "../services";
import { IProduct } from "../interfaces/product.interface";
import { STATUS_CODES } from "http";

@JsonController("/products")
@Service()
export class ProductController {
  @Inject("productService")
  service!: ProductService;

  @Put("/:code")
  async update(
    @Param("code") code: string,
    @Body() product: Partial<IProduct>,
    @Res() res: Response
  ): Promise<any> {
    if (!(await this.service.findByCode(code))) {
      throw new Error("Product not found");
    }

    const updatedProduct = await this.service.updateByCode(code, product);

    return {
      statusCode: HttpCode(res.status),
      message: "Product updated",
      data: updatedProduct,
    };
  }

  @Delete("/:code")
  async delete(@Param("code") code: string, @Res() res: Response) {
    if (!(await this.service.findByCode(code))) {
      throw new Error("Product not found");
    }

    await this.service.deleteByCode(code);

    return {
      statusCode: HttpCode(res.status),
      message: "Product deleted",
    };
  }

  @Get("/:code")
  async getOneByCode(@Param("code") code: string, @Res() res: Response) {
    const product = await this.service.findByCode(code);
    return {
      statusCode: HttpCode(res.status),
      message: "Product founded",
      data: product,
    };
  }

  @Get("/")
  async getRole(
    @QueryParams() filter: { page: number; limit: number },
    @Res() res: Response
  ) {
    const data = await this.service.findAll(filter);

    return {
      statusCode: HttpCode(res.status),
      message: "Products founded",
      ...filter,
      data,
    };
  }
}
