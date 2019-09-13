import webpack from 'webpack';
import { webpackBundleFilename } from './constants';
import { WebpackOptionsProcessor } from './interfaces';

const defaultCompilerOptionsFactory = (extraLazyImports: string[] = []) => ({
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    filename: webpackBundleFilename,
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'none',
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource: any) {
        const lazyImports = [
          '@nestjs/microservices',
          'cache-manager',
          'class-validator',
          'class-transformer',
          ...extraLazyImports,
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
  ],
});

export class WebpackCompilerFactory {
  create(
    clusteredEntries: string[],
    optionsProcessor?: WebpackOptionsProcessor,
    extraLazyImports?: string[],
    externals?: any,
  ) {
    let multiCompilerOptions: Record<string, any>[] = (
      clusteredEntries || []
    ).map((entry, index) => ({
      entry,
      externals,
      ...(defaultCompilerOptionsFactory(extraLazyImports) as Record<
        string,
        any
      >),
    }));

    if (optionsProcessor) {
      multiCompilerOptions = multiCompilerOptions.map(options =>
        optionsProcessor(options),
      );
    }
    return webpack(multiCompilerOptions);
  }
}
