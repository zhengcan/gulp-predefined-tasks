import gulp from 'gulp';
import babel from 'gulp-babel';
import _ from 'lodash';

import registerTasks from './src';

let options = {
  type: 'lib',
  webpack: {
    entry: {
      index: './src/index.js',
    },
    // config: {
    //   externals: {
    //     jquery: 'jQuery',
    //   }
    // },
    // devConfig: {
    //   entry: {
    //     b: 'b.js',
    //     c: 'ccccc.js',
    //   },
    //   externals: {
    //     eee: 123
    //   },
    //   plugins: [
    //     {
    //       some: 234
    //     }
    //   ]
    // },
    // babel: {
    //   bb: 123
    // },
    // onMerge: (object, ...sources) => {
    //   console.log('$$$$$$');
    //   console.log(object);
    //   console.log(sources);
    //   return _.mergeWith(object, ...sources, (objValue, srcValue) => {
    //     if (_.isArray(objValue)) {
    //       return objValue.concat(srcValue);
    //     }
    //   });
    // },
    // onConfig: (config) => {
    //   console.log('@@@@@ merged');
    //   console.log(config);
    //   console.log('@@@@@ babel');
    //   console.log(config.module.rules[0].use[0]);
    //   return config;
    // }
  }
};
registerTasks(gulp, options);

gulp.task('default', ['build:lib', 'build:dist']);
