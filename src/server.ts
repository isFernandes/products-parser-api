import "reflect-metadata";
import "dotenv/config";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";

import "./database";
import "./services";
import "./repositories";
import { productSync } from "./jobs/productSync";
import { ProductController, HealthyController } from "./controllers";

useContainer(Container);

const server = createExpressServer({
  controllers: [ProductController, HealthyController],
});

productSync;

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
