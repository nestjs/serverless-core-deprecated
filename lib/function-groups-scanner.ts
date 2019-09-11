import { Project } from 'ts-morph';
import { DependenciesExplorer } from './explorers/deps-explorer';
import { FunctionGroupExplorer } from './explorers/function-group-explorer';
import { FunctionGroupDeclaration } from './interfaces/function-group-declaration.interface';

export class FunctionGroupsScanner {
  private readonly depsExplorer = new DependenciesExplorer();
  private readonly functionGroupExplorer = new FunctionGroupExplorer();

  lookupFnGroupDeclarations(
    entryFile: string,
    project: Project,
    rootDirectory: string,
  ): Required<FunctionGroupDeclaration>[] {
    const functionGroups = this.getFunctionGroups(
      entryFile,
      rootDirectory,
      project,
    );
    return functionGroups.map(declaration => ({
      ...declaration,
      deps: this.depsExplorer.lookupImportedFilesByPath(
        declaration.path,
        project,
        rootDirectory,
      ),
    }));
  }

  private getFunctionGroups(
    entryFile: string,
    rootDirectory: string,
    project: Project,
  ): FunctionGroupDeclaration[] {
    const filePaths = this.depsExplorer.lookupImportedFilesByPath(
      entryFile,
      project,
      rootDirectory,
    );

    return filePaths
      .map(path =>
        this.functionGroupExplorer.getFunctionGroupDeclaration(path, project),
      )
      .filter(item => !!item) as FunctionGroupDeclaration[];
  }
}
