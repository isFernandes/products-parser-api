import { app as server } from "./app";

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
