import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/board.module';
import { TodosModule } from './todos/todo.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/user.module';
import { Tenant } from './tenants/entities/tenant.entity';
import { Board } from './boards/entities/board.entity';
import { Todo } from './todos/entities/todo.entity';

@Module({
  imports: [
    // Database connection — reads from environment variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432') || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'multi-tenant-todo-app',
      entities: [User, Tenant, Board, Todo],
      // synchronize: true auto-creates tables from entities.
      // Fine for dev — use migrations in production.
      synchronize: true,
    }),
    AuthModule,
    BoardsModule,
    TodosModule,
    UsersModule,
  ],
  providers: [
    // Automatically strip @Exclude() fields (like password) from responses
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // Validate all incoming request bodies against DTOs
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Strip unknown properties
        forbidNonWhitelisted: true, // Error on unknown properties
        transform: true, // Auto-transform types (e.g. string "1" → number 1)
      }),
    },
  ],
})
export class AppModule {}
