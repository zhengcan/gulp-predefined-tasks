import path from 'path';

export function readPackageJson() {
  let projectDir = process.cwd();
  return require(path.join(projectDir, './package.json'));  
}
