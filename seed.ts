import { NestFactory } from '@nestjs/core';
import { SeedService } from './src/seed/seed.service';
import { SeedModule } from './src/seed/seed.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);
  await seedService.seed();
  await app.close();
}

bootstrap();
