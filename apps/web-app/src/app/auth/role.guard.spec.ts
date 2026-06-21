import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';

describe('roleGuard', () => {
  it('allows access when user has required role', async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            waitUntilReady: async () => undefined,
            isAuthenticated: () => true,
            hasRole: (...roles: string[]) => roles.includes('ADMIN'),
          },
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: () => ({}) as UrlTree,
          },
        },
      ],
    }).compileComponents();

    const result = await TestBed.runInInjectionContext(() =>
      roleGuard('ADMIN')({ data: {} } as never, {} as never)
    );

    expect(result).toBe(true);
  });
});
