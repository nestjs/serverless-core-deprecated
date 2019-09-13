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
  sourceDir?: string;
  entryFile?: string;
  tsConfigFilePath?: string;
  indexFileTemplateFactory?: IndexFileTemplateFactory;
  webpackOptionsProcessor?: WebpackOptionsProcessor;
  beforeHooks?: any[];
  afterHooks?: any[];
  extraLazyImports?: string[];
  externals?: any;
  groupDecorator?: string;
}

export class Compiler {
  private readonly webpackRunner = new WebpackRunner();
  private readonly functionGroupsScanner = new FunctionGroupsScanner();
  private readonly functionGroupsClusterer = new FunctionGroupClusterer();

  async run({
    sourceDir = process.cwd(),
    entryFile = 'app.module.ts',
    groupDecorator = 'FunctionGroup',
    tsConfigFilePath = join(sourceDir, 'tsconfig.build.json'),
    externals,
    indexFileTemplateFactory,
    webpackOptionsProcessor,
    beforeHooks,
    afterHooks,
  }: CompilerOptions = {}) {
    const inMemoryFs = new MemoryFileSystem();
    const project = new Project({
      tsConfigFilePath,
    });

    const entryModuleFile = join(sourceDir, entryFile);
    const groupDeclarations = this.functionGroupsScanner.lookupFnGroupDeclarations(
      entryModuleFile,
      project,
      sourceDir,
      groupDecorator,
    );
    if (groupDeclarations.length <= 0) {
      throw new Error(
        `The compiler did not find any @${groupDecorator}() declaration in your application (0 apps).`,
      );
    }
    const clusteredGroupEntries = this.functionGroupsClusterer.cluster(
      inMemoryFs,
      project,
      sourceDir,
      groupDeclarations,
      indexFileTemplateFactory,
    );
    await this.webpackRunner.run(
      clusteredGroupEntries,
      groupDeclarations,
      inMemoryFs,
      {
        webpackOptionsProcessor,
        externals,
        beforeHooks,
        afterHooks,
      },
    );
  }
}
