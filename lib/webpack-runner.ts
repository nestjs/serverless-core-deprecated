import { CompilerOptions } from './compiler';
import { webpackBundleFilename } from './constants';
import { AfterHook, BeforeHook } from './interfaces';
import { FunctionGroupDeclaration } from './interfaces/function-group-declaration.interface';
import { applyMonkeyPatchingToFs } from './utils/fs-monkey-patching';
import { WebpackCompilerFactory } from './webpack-compiler-factory';

export class WebpackRunner {
  private readonly webpackCompilerFactory = new WebpackCompilerFactory();

  async run(
    clusteredGroupEntries: string[],
    groupDeclarations: Required<FunctionGroupDeclaration>[],
    fileSystem: any,
    options: Partial<CompilerOptions>,
  ) {
    const multiCompiler = this.webpackCompilerFactory.create(
      clusteredGroupEntries,
      options.webpackOptionsProcessor,
      options.extraLazyImports,
      options.externals,
    );
    multiCompiler.compilers.forEach(compiler => {
      compiler.inputFileSystem = fileSystem;
      compiler.outputFileSystem = fileSystem;
    });
    applyMonkeyPatchingToFs(fileSystem);

    const { beforeHooks = [], afterHooks = [] } = options;
    await this.runBeforeHooks(fileSystem, clusteredGroupEntries, beforeHooks);

    const compilerPromise = new Promise((resolve, reject) =>
      multiCompiler.run(async (err: Error, stats: any) => {
        try {
          this.printCompilationStats(stats);
          const statsPerBundle = stats.stats;
          if (!statsPerBundle) {
            throw new Error('Runtime error - webpack stats dont exist');
          }
          await this.processWebpackBundles(
            statsPerBundle,
            groupDeclarations,
            fileSystem,
            afterHooks,
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      }),
    );
    await compilerPromise;
  }

  private printCompilationStats(stats: any) {
    const statsOutput = stats.toString({
      chunks: false,
      colors: true,
      warningsFilter: /^(?!CriticalDependenciesWarning$)/,
    });
    console.log(statsOutput);
  }

  private async processWebpackBundles(
    statsPerBundle: any[],
    groupDeclarations: Required<FunctionGroupDeclaration>[],
    fileSystem: any,
    afterHooks: AfterHook[],
  ) {
    const runAfterHooksPromise = statsPerBundle.map(
      async ({ compilation }: any, index: number) => {
        if (!compilation.assets[webpackBundleFilename]) {
          throw new Error('Runtime error - webpack bundle dont exist');
        }
        const groupDeclaration = groupDeclarations[index] || {};
        const groupId = groupDeclaration && groupDeclaration.name;
        const bundle = compilation.assets[webpackBundleFilename].source();
        const {
          name,
          deps,
          entryModule,
          path,
          ...extraOptions
        } = groupDeclaration;
        this.runAfterHooks(
          fileSystem,
          groupId,
          bundle,
          extraOptions,
          afterHooks,
        );
      },
    );

    await Promise.all(runAfterHooksPromise);
  }

  private async runBeforeHooks(
    fileSystem: any,
    entries: string[],
    beforeHooks: BeforeHook[],
  ) {
    const hooksPromise = beforeHooks.map(
      async hook => await hook(fileSystem, entries),
    );
    await Promise.all(hooksPromise);
  }

  private async runAfterHooks(
    fileSystem: any,
    groupId: string,
    bundleText: string,
    extraOptions: Record<string, any>,
    afterHooks: AfterHook[],
  ) {
    const hooksPromise = afterHooks.map(
      async hook => await hook(fileSystem, groupId, bundleText, extraOptions),
    );
    await Promise.all(hooksPromise);
  }
}
