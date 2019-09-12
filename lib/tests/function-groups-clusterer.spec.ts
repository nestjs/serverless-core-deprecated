import MemoryFileSystem from 'memory-fs';
import { join } from 'path';
import { Project } from 'ts-morph';
import { FunctionGroupClusterer } from '../function-groups-clusterer';
import { FunctionGroupsScanner } from '../function-groups-scanner';
import {
  appControllerFile,
  appModuleFile,
  appServiceFile,
  coreModuleFile,
  rootModuleFile,
} from './fixtures/files';

describe('FunctionGroupClusterer', () => {
  const functionGroupsScanner = new FunctionGroupsScanner();
  let functionGroupClusterer: FunctionGroupClusterer;

  beforeEach(() => {
    functionGroupClusterer = new FunctionGroupClusterer();
  });

  describe('cluster', () => {
    it('should cluster modules per group declarations', () => {
      const project = new Project();
      project.createSourceFile('app.controller.ts', appControllerFile);
      project.createSourceFile('app.service.ts', appServiceFile);
      project.createSourceFile('app.module.ts', appModuleFile);
      project.createSourceFile('core.module.ts', coreModuleFile);
      project.createSourceFile('root.module.ts', rootModuleFile);

      const inMemoryFs = new MemoryFileSystem();
      const rootDirectory = '';
      const entryModuleFile = 'root.module.ts';
      const groupDeclarations = functionGroupsScanner.lookupFnGroupDeclarations(
        entryModuleFile,
        project,
        rootDirectory,
        'FunctionGroup',
      );
      const clusters = functionGroupClusterer.cluster(
        inMemoryFs,
        project,
        rootDirectory,
        groupDeclarations,
      );
      expect(clusters).toHaveLength(2);
      expect(clusters[0]).toEqual(
        join(process.cwd(), 'dist', 'AppModule', 'index.ts'),
      );
      expect(clusters[1]).toEqual(
        join(process.cwd(), 'dist', 'CoreModule', 'index.ts'),
      );
    });
  });
});
