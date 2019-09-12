import { join, relative } from 'path';
import { Project } from 'ts-morph';
import {
  defaultEntryFilename,
  defaultIndexFilename,
  defaultOutputDir,
} from './constants';
import { IndexFileTemplateFactory } from './interfaces';
import { FunctionGroupDeclaration } from './interfaces/function-group-declaration.interface';
import { INDEX_FILE_TEMPLATE } from './templates/index-file-template';
import { appendTsExtension } from './utils/append-extenstion';
import { writeFileSyncRecursive } from './utils/write-file-sync';

const defaultIndexFileFactory: IndexFileTemplateFactory = (
  moduleName: string,
  moduleImportPath: string,
) => INDEX_FILE_TEMPLATE`${moduleName}`;

export class FunctionGroupClusterer {
  cluster(
    fileSystem: any,
    project: Project,
    rootDirectory: string,
    groupDeclarations: Required<FunctionGroupDeclaration>[],
    indexFileTemplateFactory: IndexFileTemplateFactory = defaultIndexFileFactory,
  ): string[] {
    if (!Array.isArray(groupDeclarations)) {
      throw new Error('Invalid group declarations');
    }
    const clusterEntries = [] as string[];
    groupDeclarations.forEach(group => {
      const groupRootDir = join(process.cwd(), defaultOutputDir, group.name);

      this.saveEntryModule(project, group, groupRootDir, fileSystem);
      this.saveAllDeps(
        group.deps,
        project,
        rootDirectory,
        groupRootDir,
        fileSystem,
      );
      this.addIndexFile(
        groupRootDir,
        group.entryModule,
        indexFileTemplateFactory,
        fileSystem,
      );

      const entryFilePath = join(groupRootDir, defaultIndexFilename);
      clusterEntries.push(entryFilePath);
    });
    return clusterEntries;
  }

  saveEntryModule(
    project: Project,
    group: FunctionGroupDeclaration,
    groupRootDir: string,
    fileSystem: any,
  ) {
    const entryModule = project.getSourceFile(group.path)!.getFullText();
    const entryFilename = appendTsExtension(defaultEntryFilename);
    writeFileSyncRecursive(
      fileSystem,
      join(groupRootDir, entryFilename),
      entryModule,
    );
  }

  saveAllDeps(
    deps: string[],
    project: Project,
    rootDirectory: string,
    groupRootDir: string,
    fileSystem: any,
  ) {
    deps.forEach(dependency => {
      const entryModule = project.getSourceFile(dependency)!.getFullText();
      writeFileSyncRecursive(
        fileSystem,
        join(groupRootDir, relative(rootDirectory, dependency)),
        entryModule,
      );
    });
  }

  addIndexFile(
    groupRootDir: string,
    moduleName: string,
    indexFileTemplateFactory: IndexFileTemplateFactory,
    fileSystem: any,
  ) {
    const fileContent = indexFileTemplateFactory(
      moduleName,
      defaultEntryFilename,
    );
    writeFileSyncRecursive(
      fileSystem,
      join(groupRootDir, defaultIndexFilename),
      fileContent,
    );
  }
}
