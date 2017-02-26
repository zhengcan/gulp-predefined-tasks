import gulp from 'gulp';
import registerTasks from 'gulp-predefined-tasks';

let options = {
  type: 'web',
  webpack: {
    entry: {
      index: './src/index.js',
    },
    devServer: {
      contentBase: false,
      proxy: {
        '/': {
          target: 'http://localhost:9000/'
        }
      },
    },
  }
};
registerTasks(gulp, options);
