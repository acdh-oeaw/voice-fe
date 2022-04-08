module.exports = {
  root: true,

  env: {
    node: true
  },

  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],

  rules: {
    'no-console': 'off',
    'vue/no-unused-components': 'off',
    'no-unused-vars': 'off',
  //  'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/multi-word-component-names": ["error", {
      "ignores": ["Audioplayer", "Tool", "Home"]
    }],
    // unfortunately it is to late to change this, the whole state handling manpulates props :(
    "vue/no-mutating-props": 'off'
  },

  parserOptions: {
    parser: '@babel/eslint-parser'
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
