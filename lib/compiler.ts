import MemoryFileSystem from 'memory-fs';
import { join } from 'path';
import { Project } from 'ts-morph';
import { FunctionGroupClusterer } from './function-groups-clusterer';
import { FunctionGroupsScanner } from './function-groups-scanner';
import {
  IndexFileTemplateFactory,
  WebpackOptionsProcessor,
} from './interfaces';
import { WebpackRunner } from './webpack-runner';

export interface CompilerOptions {
  rootDirectory?: string;
  entryFile?: string;
  indexFileTemplateFactory?: IndexFileTemplateFactory;
  webpackOptionsProcessor?: WebpackOptionsProcessor;
  beforeHooks?: any[];
  afterHooks?: any[];
  extraLazyImports?: string[];
  groupDecorator?: string;
}

export class Compiler {
  private readonly webpackRunner = new WebpackRunner();
  private readonly functionGroupsScanner = new FunctionGroupsScanner();
  private readonly functionGroupsClusterer = new FunctionGroupClusterer();

  async run({
    rootDirectory = 'sample/src',
    entryFile = 'app.module.ts',
    groupDecorator = 'FunctionGroup',
    indexFileTemplateFactory,
    webpackOptionsProcessor,
    beforeHooks,
    afterHooks,
  }: CompilerOptions = {}) {
    const inMemoryFs = new MemoryFileSystem();
    const project = new Project({
      tsConfigFilePath: join(process.cwd(), 'sample/tsconfig.build.json'),
    });

    const entryModuleFile = join(rootDirectory, entryFile);
    const groupDeclarations = this.functionGroupsScanner.lookupFnGroupDeclarations(
      entryModuleFile,
      project,
      rootDirectory,
      groupDecorator,
    );
    const clusteredGroupEntries = this.functionGroupsClusterer.cluster(
      inMemoryFs,
      project,
      rootDirectory,
      groupDeclarations,
      indexFileTemplateFactory,
    );
    await this.webpackRunner.run(
      clusteredGroupEntries,
      groupDeclarations,
      inMemoryFs,
      {
        webpackOptionsProcessor,
        beforeHooks,
        afterHooks,
      },
    );
  }
}
