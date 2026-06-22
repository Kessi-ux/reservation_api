import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Application metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
  })
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
