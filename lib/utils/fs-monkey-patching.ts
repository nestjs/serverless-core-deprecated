const fs = require('fs');

export function applyMonkeyPatchingToFs(inMemoryFs: any) {
  const statOrig = inMemoryFs.stat.bind(inMemoryFs);
  const readFileOrig = inMemoryFs.readFile.bind(inMemoryFs);
  inMemoryFs.stat = function(_path: string, cb: Function) {
    statOrig(_path, function(err: Error, result: string) {
      if (err && _path.includes('node_modules')) {
        return fs.stat(_path, cb);
      } else {
        return cb(err, result);
      }
    });
  };
  inMemoryFs.readFile = function(path: string, cb: Function) {
    readFileOrig(path, function(err: Error, result: string) {
      if (err && path.includes('node_modules')) {
        return fs.readFile(path, cb);
      } else {
        return cb(err, result);
      }
    });
  };
}
