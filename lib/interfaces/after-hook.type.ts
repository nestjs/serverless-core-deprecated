export type AfterHook = (
  fileSystem: any,
  groupId: string,
  bundleText: string,
  extraOptions: Record<string, any>,
) => any;
