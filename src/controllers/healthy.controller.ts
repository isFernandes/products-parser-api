import { JsonController, Get } from "routing-controllers";
import { Inject, Service } from "typedi";
import { ImportService } from "../services";

// - `GET /`: Detalhes da API, se conexão leitura e escritura com a base de dados está OK, horário da última vez que o CRON foi executado, tempo online e uso de memória.

@JsonController("/")
@Service()
export class HealthyController {
  @Inject("importService")
  private importService!: ImportService;

  @Get()
  async healthy() {
    const filename = await this.importService.importData();

    return { filename };
  }
}
