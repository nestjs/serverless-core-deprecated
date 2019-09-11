import { Project } from 'ts-morph';
import { FunctionGroupExplorer } from '../../explorers/function-group-explorer';
import {
  appControllerFile,
  appModuleFile,
  appModuleFileWithGroupName,
} from '../fixtures/files';

describe('FunctionGroupExplorer', () => {
  let functionGroupExplorer: FunctionGroupExplorer;

  beforeEach(() => {
    functionGroupExplorer = new FunctionGroupExplorer();
  });

  describe('getFunctionGroupDeclaration', () => {
    describe('when not a group module', () => {
      it('should return undefined', () => {
        const project = new Project();
        project.createSourceFile('app.controller.ts', appControllerFile);
        expect(
          functionGroupExplorer.getFunctionGroupDeclaration(
            'app.controller.ts',
            project,
          ),
        ).toBeUndefined();
      });
    });
    describe('when a group module', () => {
      describe('when name is not passed', () => {
        it('should use default name (class constructor name)', () => {
          const project = new Project();
          project.createSourceFile('app.module.ts', appModuleFile);
          expect(
            functionGroupExplorer.getFunctionGroupDeclaration(
              'app.module.ts',
              project,
            ),
          ).toEqual({
            name: 'AppModule',
            entryModule: 'AppModule',
            path: 'app.module.ts',
          });
        });
      });
      describe('when name is passed', () => {
        it('should use name parameter', () => {
          const project = new Project();
          project.createSourceFile('app.module.ts', appModuleFileWithGroupName);
          expect(
            functionGroupExplorer.getFunctionGroupDeclaration(
              'app.module.ts',
              project,
            ),
          ).toEqual({
            name: 'main',
            entryModule: 'AppModule',
            path: 'app.module.ts',
          });
        });
      });
    });
  });
});
