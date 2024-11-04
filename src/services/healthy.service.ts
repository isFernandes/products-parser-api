import { Inject, Service } from "typedi";
import { HealthyRepository, ImportHistoryRepository } from "../repositories";
import { HttpError } from "routing-controllers";

@Service("healthyService")
export class HealthyService {
  @Inject("healthyRepository")
  private repository!: HealthyRepository;

  @Inject("importHistoryRepository")
  private importRepository!: ImportHistoryRepository;

  async getDatabaseHealth() {
    try {
      return await this.repository.checkDatabase();
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  async getLastImport() {
    try {
      return await this.importRepository.getLastUpdate();
    } catch (error) {
      throw new HttpError(500, JSON.stringify(error));
    }
  }

  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
    };
  }

  getUptime() {
    const uptime = process.uptime();
    return `${Math.floor(uptime / 60)} minutes ${Math.floor(
      uptime % 60
    )} seconds`;
  }
}
