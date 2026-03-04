import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const session = require('express-session');
import passport from 'passport';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:8081',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Session
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const FileStore = require('session-file-store')(session);
  const sessionsDir = path.join(process.cwd(), 'data', 'sessions');

  app.use(
    session({
      store: new FileStore({ path: sessionsDir, ttl: 60 * 60 * 24 * 30, retries: 1 }),
      secret: process.env.SESSION_SECRET ?? 'usus-dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = parseInt(process.env.PORT ?? '5112', 10);
  await app.listen(port);
  console.log(`NestJS backend running on http://localhost:${port}`);
}

bootstrap();
