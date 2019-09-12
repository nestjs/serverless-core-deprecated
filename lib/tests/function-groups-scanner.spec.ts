import { join } from 'path';
import { Project } from 'ts-morph';
import { FunctionGroupsScanner } from '../function-groups-scanner';
import {
  appControllerFile,
  appModuleFile,
  appServiceFile,
  coreModuleFile,
  rootModuleFile,
} from './fixtures/files';

describe('FunctionGroupsScanner', () => {
  let functionGroupsScanner: FunctionGroupsScanner;

  beforeEach(() => {
    functionGroupsScanner = new FunctionGroupsScanner();
  });

  describe('lookupFnGroupDeclarations', () => {
    it('should lookup function group declarations and merge dependencies', () => {
      const project = new Project();
      project.createSourceFile('app.controller.ts', appControllerFile);
      project.createSourceFile('app.service.ts', appServiceFile);
      project.createSourceFile('app.module.ts', appModuleFile);
      project.createSourceFile('core.module.ts', coreModuleFile);
      project.createSourceFile('root.module.ts', rootModuleFile);

      const rootDirectory = '';
      const entryModuleFile = 'root.module.ts';
      const groupDeclarations = functionGroupsScanner.lookupFnGroupDeclarations(
        entryModuleFile,
        project,
        rootDirectory,
        'FunctionGroup',
      );
      const prependCwdPath = (path: string) => join(process.cwd(), path);
      expect(groupDeclarations[0]).toEqual({
        deps: [
          prependCwdPath('app.controller.ts'),
          prependCwdPath('app.service.ts'),
        ],
        entryModule: 'AppModule',
        name: 'AppModule',
        path: prependCwdPath('app.module.ts'),
      });
      expect(groupDeclarations[1]).toEqual({
        deps: [
          prependCwdPath('app.controller.ts'),
          prependCwdPath('app.service.ts'),
        ],
        entryModule: 'CoreModule',
        name: 'CoreModule',
        path: prependCwdPath('core.module.ts'),
      });
    });
  });
});
