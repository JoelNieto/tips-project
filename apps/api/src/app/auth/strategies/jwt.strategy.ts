import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { pick } from 'lodash';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // TODO: Add cookie auth
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return pick(payload, ['email', '_id', 'username', 'role']);
  }
}
