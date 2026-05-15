import "reflect-metadata";
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';

dotenv.config();
console.log('💎 reflect-metadata loaded:', typeof Reflect.getMetadata === 'function');

// Ensure DATABASE_URL is set for Prisma fallback
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:/app/applet/prisma/dev.db';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enterprise validation global pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // API Prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('AutoSync Pro API')
    .setDescription('Enterprise Workshop Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const expressApp = app.getHttpAdapter().getInstance();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Redirect all non-API requests to Vite
    expressApp.use((req, res, next) => {
      if (req.url.startsWith('/api')) {
        next();
      } else {
        vite.middlewares(req, res, next);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  try {
    await app.listen(PORT, '0.0.0.0');
    console.log(`🚀 System running on: http://localhost:${PORT}`);
    console.log(`📝 API Docs available at: http://localhost:${PORT}/api/docs`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

bootstrap();
