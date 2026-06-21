import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserRole } from '@generated/prisma';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthPolicyService } from '../auth/auth-policy.service';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { EmployeeEntity } from './dto/employee.entity';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { EmployeeService } from './employee.service';

@Resolver(() => EmployeeEntity)
@UseGuards(RolesGuard)
export class EmployeeResolver {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  @Query(() => [EmployeeEntity], { name: 'employees' })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async employees(
    @Args('companyId', { type: () => ID }) companyId: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.employeeService.findByCompany(companyId, user);
  }

  @Query(() => EmployeeEntity, { name: 'employee', nullable: true })
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.EMPLOYEE)
  async employee(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.employeeService.findOne(id, user);
  }

  @Mutation(() => EmployeeEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async createEmployee(
    @Args('input') input: CreateEmployeeInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.employeeService.create(input, user);
  }

  @Mutation(() => EmployeeEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeInput,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.employeeService.update(id, input, user);
  }

  @Mutation(() => EmployeeEntity)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async deleteEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    const user = await this.authPolicy.getUserContext(session.user.id);
    return this.employeeService.delete(id, user);
  }
}
