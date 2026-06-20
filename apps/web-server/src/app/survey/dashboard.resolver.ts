import { Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { DashboardSummaryEntity } from './dto/dashboard-summary.entity';
import { DashboardService } from './dashboard.service';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardSummaryEntity, { name: 'dashboardSummary' })
  async dashboardSummary(@Session() session: UserSession) {
    return this.dashboardService.getSummary(session.user.id);
  }
}
