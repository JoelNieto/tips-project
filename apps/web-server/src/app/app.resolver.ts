import { Query, Resolver } from '@nestjs/graphql';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@AllowAnonymous()
@Resolver()
export class AppResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello from GraphQL';
  }
}
