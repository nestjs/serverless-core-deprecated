import fs from 'fs';

export function getFileContent(srcPath: string) {
  return new Promise<string>(async (resolve, reject) => {
    fs.readFile(srcPath, 'utf8', (err: Error, content: string) =>
      err ? reject(err) : resolve(content),
    );
  });
}

export function copyFileContent(destPath: string, srcPath: string) {
  return new Promise(async (resolve, reject) => {
    const content = await getFileContent(srcPath);
    fs.writeFile(destPath, content, err => (err ? reject(err) : resolve()));
  });
}

export function copyFileIfNotExists(destPath: string, srcPath: string) {
  return new Promise(async (resolve, reject) => {
    fs.exists(destPath, exists => {
      if (exists) {
        return resolve();
      }
      copyFileContent(destPath, srcPath)
        .then(resolve)
        .catch(reject);
    });
  });
}
