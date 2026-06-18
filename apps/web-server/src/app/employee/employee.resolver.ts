import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { EmployeeEntity } from './dto/employee.entity';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { EmployeeService } from './employee.service';

@Resolver(() => EmployeeEntity)
export class EmployeeResolver {
  constructor(private readonly employeeService: EmployeeService) {}

  @Query(() => [EmployeeEntity], { name: 'employees' })
  async employees(@Args('companyId', { type: () => ID }) companyId: string) {
    return this.employeeService.findByCompany(companyId);
  }

  @Query(() => EmployeeEntity, { name: 'employee', nullable: true })
  async employee(@Args('id', { type: () => ID }) id: string) {
    return this.employeeService.findOne(id);
  }

  @Mutation(() => EmployeeEntity)
  async createEmployee(@Args('input') input: CreateEmployeeInput) {
    return this.employeeService.create(input);
  }

  @Mutation(() => EmployeeEntity)
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateEmployeeInput
  ) {
    return this.employeeService.update(id, input);
  }

  @Mutation(() => EmployeeEntity)
  async deleteEmployee(@Args('id', { type: () => ID }) id: string) {
    return this.employeeService.delete(id);
  }
}
