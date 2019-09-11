export const appServiceFile = `
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}`;

export const appControllerFile = `
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}`;

export const appModuleFile = `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@FunctionGroup()
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

export const appModuleFileWithGroupName = `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@FunctionGroup('main')
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

export const coreModuleFile = `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@FunctionGroup()
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class CoreModule {}`;

export const rootModuleFile = `
import { Module } from '@nestjs/common';
import { AppModule } from './app.module';
import { CoreModule } from './core.module';

@Module({
  imports: [AppModule, CoreModule],
})
export class RootModule {}`;
