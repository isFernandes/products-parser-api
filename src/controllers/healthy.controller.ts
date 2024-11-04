import { JsonController, Get } from "routing-controllers";
import { Inject, Service } from "typedi";
import { HealthyService } from "../services";

// - `GET /`: Detalhes da API, se conexão leitura e escritura com a base de dados está OK, horário da última vez que o CRON foi executado, tempo online e uso de memória.

@JsonController("/")
@Service()
export class HealthyController {
  @Inject("healthyService")
  private healthyService!: HealthyService;

  @Get()
  async getHealthStatus() {
    const { ok } = await this.healthyService.getDatabaseHealth();

    const lastImport = await this.healthyService.getLastImport();

    const memoryUsage = this.healthyService.getMemoryUsage();

    const uptime = this.healthyService.getUptime();

    const response = {
      dbData: { ok: !!ok },
      lastImport,
      memoryUsage,
      uptime,
    };

    return response;
  }
}
