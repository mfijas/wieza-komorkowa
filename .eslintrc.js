module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'standard'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint'
    ],
    rules: {
        'padded-blocks': 'off',
        'space-before-function-paren': ['warn', 'never'],
        'indent': ['warn', 4, { 'SwitchCase': 1 }],
        'quote-props': 'off',
        'multiline-ternary': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'semi': ['off'],
        '@typescript-eslint/semi': ['error', 'always'],
        'react/jsx-indent': ['warn', 4]
    }
};
