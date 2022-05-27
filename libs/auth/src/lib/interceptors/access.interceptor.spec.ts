import { TestBed } from '@angular/core/testing';

import { AccessInterceptor } from './access.interceptor';

describe('AccessInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AccessInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AccessInterceptor = TestBed.inject(AccessInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
