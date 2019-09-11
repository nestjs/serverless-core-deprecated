import { join } from 'path';
import { Project } from 'ts-morph';
import { DependenciesExplorer } from '../../explorers/deps-explorer';
import { appControllerFile, appServiceFile } from '../fixtures/files';

describe('DependenciesExplorer', () => {
  let depsExplorer: DependenciesExplorer;

  beforeEach(() => {
    depsExplorer = new DependenciesExplorer();
  });

  describe('lookupImportedFilesByPath', () => {
    it('should gather all imports excluding node_modules', () => {
      const project = new Project();
      project.createSourceFile('app.controller.ts', appControllerFile);
      project.createSourceFile('app.service.ts', appServiceFile);

      const imports = depsExplorer.lookupImportedFilesByPath(
        'app.controller.ts',
        project,
        '',
      );
      expect(join(process.cwd(), 'app.service.ts')).toEqual(imports[0]);
      expect(imports).toHaveLength(1);
    });
  });
});
