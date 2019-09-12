import { defaultEntryFilename } from '../constants';

export const defaultEntryModulePath = `./${defaultEntryFilename}`;

export const INDEX_FILE_TEMPLATE = (text: any, moduleName: string) => `
import { NestFactory } from '@nestjs/core';
import { ${moduleName} } from '${defaultEntryModulePath}';

export async function createApp() {
  const app = await NestFactory.create(${moduleName});
  return app.listen(3000)
}

createApp()
`;
