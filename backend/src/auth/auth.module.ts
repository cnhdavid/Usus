import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PassportModule.register({ session: true }), UsersModule],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
