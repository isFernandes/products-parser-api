import "reflect-metadata";
import "dotenv/config";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import "./database";
import "./services";
import "./repositories";
import { productSync } from "./jobs/productSync";
import { ProductController, HealthyController } from "./controllers";

useContainer(Container);

const swaggerDocument = YAML.load("./docs/api.yml");

const app = createExpressServer({
  controllers: [ProductController, HealthyController],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

productSync;

export { app };
