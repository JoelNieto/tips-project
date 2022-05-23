import { PassportStrategy } from '@nestjs/passport';
import { pick } from 'lodash';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { environment } from '../../../environments/environment';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // TODO: Add cookie auth
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: environment.jwtKey,
    });
  }

  async validate(payload: any) {
    return pick(payload, ['email', '_id', 'username', 'role']);
  }
}
