export const TYPE_WEB = 'web';
export const TYPE_LIB = 'lib';

export const JS_FILES = '**/*.{js,jsx}';
export const LESS_FILES = '**/*.less';
export const CSS_FILES = '**/*.css';
export const IMAGE_FILES = '**/*.{png,jpg,jpeg,gif,svg}';
export const FONT_FILES = '**/*.{eot,ttf,woff,woff2}';

export function getBabelOptions(hasReact) {
  if (hasReact) {
    return {
      presets: ['es2015', 'react', 'stage-0']
    };
  } else {
    return {
      presets: ['es2015', 'stage-0']
    };
  }
}

export function getWebpackBabelOptions(hasReact) {
  if (hasReact) {
    return {
      presets: [
        ['es2015', { modules: false }],
        'react',
        'stage-0',
      ],
      env: {
        watch: {
          plugins: [
            'react-hot-loader/babel',
          ],
        }
      },
    };
  } else {
    return {
      presets: [
        ['es2015', { modules: false }],
        'stage-0',
      ],
      env: {
        test: {
          presets: ['es2015', 'stage-0']
        }
      }
    };
  }
}
