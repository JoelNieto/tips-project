import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CompanyEntity } from './dto/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { CompanyService } from './company.service';

@Resolver(() => CompanyEntity)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [CompanyEntity], { name: 'companies' })
  async companies(@Session() session: UserSession) {
    return this.companyService.findAll(session.user.id);
  }

  @Query(() => CompanyEntity, { name: 'company', nullable: true })
  async company(@Args('id', { type: () => ID }) id: string) {
    return this.companyService.findOne(id);
  }

  @Mutation(() => CompanyEntity)
  async createCompany(
    @Args('input') input: CreateCompanyInput,
    @Session() session: UserSession
  ) {
    return this.companyService.create(input, session.user.id);
  }

  @Mutation(() => CompanyEntity)
  async updateCompany(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCompanyInput,
    @Session() session: UserSession
  ) {
    return this.companyService.update(id, input, session.user.id);
  }

  @Mutation(() => CompanyEntity)
  async deleteCompany(
    @Args('id', { type: () => ID }) id: string,
    @Session() session: UserSession
  ) {
    return this.companyService.delete(id, session.user.id);
  }
}
