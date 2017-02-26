module.exports = {
  root: true,
  'ecmaFeatures': {
    'jsx': true,
    'modules': true
  },
  'env': {
    'browser': true,
    'node': true
  },
  'parser': 'babel-eslint',
  'rules': {
    'strict': [2, 'never'],
    'generator-star-spacing': 1,
    'array-bracket-spacing': 1,
    'babel/new-cap': 1,
    'babel/object-curly-spacing': 0,
    'babel/object-shorthand': 0,
    'babel/arrow-parens': 0,
    'babel/no-await-in-loop': 1,
    'react/display-name': 0,
    'react/jsx-no-duplicate-props': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/no-danger': 2,
    'react/no-deprecated': 2,
    'react/no-did-mount-set-state': [2],
    'react/no-did-update-set-state': [2],
    'react/no-direct-mutation-state': 2,
    'react/no-is-mounted': 2,
    'react/no-unknown-property': 2,
    'react/prop-types': 1,
    'react/react-in-jsx-scope': 2
  },
  'plugins': [
    'babel',
    'react',
    'flowtype'
  ]
}
