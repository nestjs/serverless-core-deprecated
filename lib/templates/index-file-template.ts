import { defaultEntryFilename } from '../constants';

export const defaultEntryModulePath = `./${defaultEntryFilename}`;

export const INDEX_FILE_TEMPLATE = (text: any, moduleName: string) => `
import { Context, HttpRequest } from '@azure/functions';
import { AzureHttpAdapter } from '@nestjs/azure-func-http';
import { NestFactory } from '@nestjs/core';
import { ${moduleName} } from '${defaultEntryModulePath}';

export async function createApp() {
  const app = await NestFactory.create(${moduleName});
  await app.init();
  return app;
}

export default function(context: Context, req: HttpRequest): void {
  AzureHttpAdapter.handle(createApp, context, req);
}
`;
