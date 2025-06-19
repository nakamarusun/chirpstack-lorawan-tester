import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChirpWebhookController } from './chirp-webhook/chirp-webhook.controller';
import { ChirpWebhookService } from './chirp-webhook/chirp-webhook.service';
import { ChirpService } from './chirp/chirp.service';
import { ChirpController } from './chirp/chirp.controller';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: "MQTT_SERVICE",
          inject: [ConfigService],
          useFactory: (config: ConfigService): ClientProvider => ({
            transport: Transport.MQTT,
            options: {
              url: config.get("MOSQUITTO_URL"),
            },
          }),
        },
      ],
    }),
  ],
  controllers: [AppController, ChirpWebhookController, ChirpController, EventsController],
  providers: [AppService, ChirpWebhookService, ChirpService, EventsService],
})
export class AppModule {}
