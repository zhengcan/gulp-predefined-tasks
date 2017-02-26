# gulp-predefined-tasks

This project provides several common used tasks for Gulp.

[![Travis][build-badge]][build]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![npm][npm-badge]][npm]

It has built-in support for: [Babel][babel], [React][react], [Webpack 2][webpack] ([HMR][hmr], [Tree Shaking][tree-shaking]), [Mocha][mocha] and more.

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

3. add `gulpfile.babel.js`

```
  import registerTasks from 'gulp-predefined-tasks';

  let options = {};
  registerTasks(gulp, options);
```

4. edit `package.json` to add scripts

```
  "scripts": {
    "build": "gulp",
    "build:dev": "cross-env NODE_ENV=development gulp build:dev",
    "build:prod": "cross-env NODE_ENV=production gulp build:prod",
    "clean": "gulp clean",
    "test": "gulp test",
    "test:watch": "gulp test:watch",
    "webpack:dev": "cross-env NODE_ENV=development gulp webpack:dev",
    "webpack:prod": "cross-env NODE_ENV=production gulp webpack:prod",
    "start": "cross-env NODE_ENV=watch gulp webpack:watch"
  },
```

5. add `.babelrc`

To support [Tree Shaking][tree-shaking] feature, we should add two `.babelrc` files.

In root folder:

```
  {
    "presets": ["es2015", "react", "stage-0"]
  }
```

In `srcDir` folder:

```
  {
    "presets": [
      ["es2015", { "modules": false }],
      "stage-0",
      "react"
    ],
    "env": {
      "watch": {
        "plugins": [
          "react-hot-loader/babel",
        ],
      },
      "test": {
        "presets": ["es2015", "react", "stage-0"]
      }
    }
  }
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

    config: String or Object,             // default config file
    devConfig: String or Object,          // merge with `config` for `webpack:dev`
    prodConfig: String or Object,         // merge with `config` for `webpack:prod`
    watchConfig: String or Object,        // merge with `config` for `webpack:watch`

    babel: Object,

    devServer: {
      host: String,                       // default: 0.0.0.0
      port: bool,                         // default: 3000
      hot: bool,                          // default: true
      contentBase: bool or Object,
      proxy: Object,
      ...
    },

    onMerge: function,                    // merge all config objects
    onEntry: function,                    // rewrite entry item
    onConfig: function,                   // handle merged config object
  }
```

#### config / devConfig / prodConfig / watchConfig

It could be webpack config file path, or webpack config object.

#### babel: Object

[Babel][babel] options object.

Default: `{ presets: [["es2015", { modules: false }], "react", "stage-0"] }`

#### devServer: Object

The options object of WebpackDevServer.

#### onMerge: (object, sources): Object

- object (Object): The destination object.
- sources (...Object): The source objects.

As default, it will concat any array values.

#### onEntry: (entry): String or Array

- entry (String or Array): The value of entry.

#### onConfig: (config): Object

- config (Object): The merged config object.

## CLI arguments

The following argument could be set via CLI.

- `libDir`
  - overwrite the value of `options.srcDir`
- `distDir`
  - overwrite the value of `options.distDir`
- `outputFilename`
  - overwrite the value of `options.webpack.config.output.filename`

For example:

```
  yarn run build -- --libDir <NEW_LIB_DIR>
```

## Tasks

### help

Show all tasks.

### build:dev

Build project in `dev` mode.

- For `lib` project, it will run `build:lib` and `webpack:dev`.
- For `web` project, it will run `webpack:dev`.

### build:prod

Build project in `prod` mode.

- For `lib` project, it will run `webpack:prod`.
- For `web` project, it will run `webpack:prod`.

### build:lib

Build project as `library`.

It will generate several artifacts in `dev` mode.

### build:dist

Build project as `distribution`.

It will generate several artifacts in `prod` mode.

### build:deps

### watch / watch:lib

Watch project, and build as `library`.

It depends on `build:lib`.

### webpack:dev

### webpack:prod

### webpack:watch

### lint / lint:watch

### test / test:watch

Run tests by using [Mocha][mocha].

## Known Issues

- Yarn
  - Yarn ignore `.npmignore` when publishing artifacts
    - https://github.com/yarnpkg/yarn/issues/685
    - https://github.com/yarnpkg/yarn/issues/754
- Webpack UglifyJsPlugin
  - Unable to drop unused React component
    - UglifyJS warning: `Side effects in initialization of unused variable XxxReactComponent`
- Webpack less-loader
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
[mocha]: https://github.com/mochajs/mocha
[hmr]: https://webpack.js.org/guides/hmr-react/
[tree-shaking]: https://webpack.js.org/guides/tree-shaking/
