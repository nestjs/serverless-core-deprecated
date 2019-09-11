import { isAbsolute, resolve, sep } from 'path';

export function writeFileSyncRecursive(
  fileSystem: any,
  filename: string,
  content: string,
) {
  const folders = filename.split(sep).slice(0, -1);
  if (folders.length) {
    mkDirByPathSync(fileSystem, folders.join(sep));
  }
  fileSystem.writeFileSync(filename, content, { flag: 'w' });
}

function mkDirByPathSync(
  fileSystem: any,
  targetDir: string,
  { isRelativeToScript = false } = {},
) {
  const initDir = isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  return targetDir.split(sep).reduce((parentDir: string, childDir: string) => {
    const curDir = resolve(baseDir, parentDir, childDir);
    try {
      fileSystem.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') {
        return curDir;
      }
      if (err.code === 'ENOENT') {
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }
      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || (caughtErr && curDir === resolve(targetDir))) {
        throw err;
      }
    }
    return curDir;
  }, initDir);
}
