# gulp-predefined-tasks

This project provides several common used tasks for Gulp.

[![Travis][build-badge]][build]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![npm][npm-badge]][npm]

It has built-in support for: [Babel][babel], [React][react], [Webpack 2][webpack] and more.

## Getting Started (Yarn)

1. create project

```
  yarn init
```

2. add Yarn / NPM packages

```
  yarn add -D cross-env gulp babel-register
  yarn add -D gulp-predefined-tasks
```

3. add gulpfile.babel.js

```
  import registerTasks from 'gulp-predefined-tasks';

  let options = {};
  registerTasks(gulp, options);
```

4. edit package.json to add scripts

```
  "scripts": {
    "build": "gulp",
    "start": "cross-env NODE_ENV=watch gulp webpack:watch",
    "webpack:dev": "cross-env NODE_ENV=development gulp webpack:dev",
    "webpack:prod": "cross-env NODE_ENV=production gulp webpack:prod"
  },
```

## Options

```
  {
    type: 'web',
    srcDir: './src/',
    testDir: './test/',
    libDir: './lib/',
    distDir: './dist/',
    babel: { ... },
    webpack: { ... }
  }
```

### type: String

Project type.

- `web` (default)
  - Standalone web app
- `lib`
  - NPM package

### srcDir: String

The folder to store source code files.

Default: `./src/`

### testDir: String

The folder to store test code files.

Default: `./test/`

### libDir: String

The folder to store published artifacts.

Default: `./lib/`

### distDir: String

The folder to store published distribution artifacts.

Default: `./dist/`

### babel: Object

The default [Babel][babel] configuration.

Default: `{ presets: ["es2015", "react", "stage-0"] }`

### webpack: Object

Webpack configuration.

```
  {
    entry: String or Array or Object,
    outputPath: String,
    publicPath: String,
    libraryTarget: String,
    externals: Object,
    babel: Object,
    config: Object,

    devOutputPath: String,
    devConfig: Object,

    prodOutputPath: String,
    prodConfig: Object,

    watchOutputPath: String,
    watchConfig: Object,
    devServer: {
      host: String,
      port: bool,
      proxy: Object,
      ...
    }
  }
```

## Tasks

### help

Show all tasks.

### build:dev

Build project in `dev` mode.

### build:prod

Build project in `prod` mode.

### build:lib

Build project as `library`.

### build:dist

Build project as `distribution`.

### build:deps

### watch / watch:lib

### webpack:dev

### webpack:prod

### webpack:watch

### lint / lint:watch

### test / test:watch

## Known Issues

- less-loader
  - Unable to resolve module error when working with css-loader?modules=true
    - https://github.com/webpack-contrib/less-loader/issues/109

[build-badge]: https://travis-ci.org/zhengcan/gulp-predefined-tasks.svg?branch=master
[build]: https://travis-ci.org/zhengcan/gulp-predefined-tasks
[downloads-image]: https://img.shields.io/npm/dm/gulp-predefined-tasks.svg
[npm-image]: https://img.shields.io/npm/v/gulp-predefined-tasks.svg
[npm-url]: https://www.npmjs.com/package/gulp-predefined-tasks
[npm-badge]: https://badge.fury.io/js/gulp-predefined-tasks.svg
[npm]: https://badge.fury.io/js/gulp-predefined-tasks
[gulp]: https://github.com/gulpjs/gulp
[babel]: https://github.com/babel/babel
[react]: https://github.com/facebook/react
[webpack]: https://github.com/webpack/webpack
