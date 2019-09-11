import { resolve } from 'path';
import { Project } from 'ts-morph';
import { appendTsExtension } from '../utils/append-extenstion';

export class DependenciesExplorer {
  lookupImportedFilesByPath(
    path: string,
    project: Project,
    rootDirectory: string,
    imports: string[] = [],
  ): string[] {
    const file = project.getSourceFile(path);
    if (!file) {
      throw new Error(`"${path}" does not exist in this project`);
    }

    const importDeclarations = file.getImportDeclarations();
    for (const importRef of importDeclarations) {
      const importPath = importRef.getModuleSpecifier().getLiteralText();
      const isRelative = importPath && importPath[0] === '.';
      if (isRelative) {
        const nextPath = resolve(rootDirectory, importPath);
        const nextPathWithExtenstion = appendTsExtension(nextPath);
        if (imports.includes(nextPathWithExtenstion)) {
          continue;
        }

        imports.push(nextPathWithExtenstion);
        this.lookupImportedFilesByPath(
          nextPathWithExtenstion,
          project,
          rootDirectory,
          imports,
        );
      }
    }
    return Array.from(new Set(imports));
  }
}
