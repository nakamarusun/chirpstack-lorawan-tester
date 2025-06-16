import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ChirpWebhookController } from './chirp-webhook/chirp-webhook.controller';
import { ChirpWebhookService } from './chirp-webhook/chirp-webhook.service';
import { ChirpService } from './chirp/chirp.service';
import { ChirpController } from './chirp/chirp.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule
  ],
  controllers: [AppController, ChirpWebhookController, ChirpController],
  providers: [AppService, ChirpWebhookService, ChirpService],
})
export class AppModule {}
