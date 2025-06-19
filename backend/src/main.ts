import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: app.get(ConfigService).get("MOSQUITTO_URL"),
    },
  });
  await app.startAllMicroservices();

  app.setGlobalPrefix('api');

  // Serve static files from the 'public' directory
  app.useStaticAssets('public', {
    prefix: '/public',
  });

  await app.listen(3000);
}
bootstrap();
