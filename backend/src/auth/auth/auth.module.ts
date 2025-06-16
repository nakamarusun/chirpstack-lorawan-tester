import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtStrategy],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          algorithm: "HS256",
          issuer: "chrp-lrwn-tst",
          expiresIn: "6h",
        },
      }),
    }),
  ],
})
export class AuthModule {}
