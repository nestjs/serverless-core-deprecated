export type IndexFileTemplateFactory = (
  moduleName: string,
  functionName: string,
  moduleImportPath: string,
) => string;
