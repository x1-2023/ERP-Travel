import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    let dbStatus = 'healthy';
    let tableCount = 0;
    let userCount = -1;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const tables = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::int as count FROM pg_tables WHERE schemaname = 'public'
      `;
      tableCount = Number(tables[0]?.count ?? 0);
      try {
        const users = await this.prisma.user.count();
        userCount = users;
      } catch {
        userCount = -1; // table doesn't exist
      }
    } catch {
      dbStatus = 'unhealthy';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      deployedAt: process.env.RENDER_GIT_COMMIT || 'local',
      services: {
        api: 'healthy',
        database: dbStatus,
      },
      schema: {
        tableCount,
        userCount,
      },
    };
  }
}
