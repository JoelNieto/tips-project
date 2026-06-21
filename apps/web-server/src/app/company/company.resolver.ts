import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { CompanyEntity } from './dto/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { CompanyService } from './company.service';

@Resolver(() => CompanyEntity)
@UseGuards(RolesGuard)
export class CompanyResolver {
  constructor(
    private readonly companyService: CompanyService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [CompanyEntity], { name: 'companies' })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async companies(@Session() session: UserSession) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.companyService.findAll(user);
  }

  @Query(() => CompanyEntity, { name: 'company', nullable: true })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.EMPLOYEE)
  async company(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.companyService.findOne(id, user);
  }

  @Mutation(() => CompanyEntity)
  @Roles(UserRole.ADMIN)
  async createCompany(
    @Args('input') input: CreateCompanyInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.companyService.create(input, user);
  }

  @Mutation(() => CompanyEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async updateCompany(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCompanyInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.companyService.update(id, input, user);
  }

  @Mutation(() => CompanyEntity)
  @Roles(UserRole.ADMIN)
  async deleteCompany(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.companyService.delete(id, user);
  }
}
