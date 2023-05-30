module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
          "files": [ "client/**/*.js" ],
          "parser": "@babel/eslint-parser",
          "parserOptions": {
            "requireConfigFile": false,
            "ecmaFeatures": {
              "jsx": true
            },
            "babelOptions": {
              "presets": ["@babel/preset-react"]
           }
          },
          "extends": [
            "eslint:recommended",
            "plugin:react/recommended"
          ],
          "plugins": [
            "jsx"
          ]
        }
      ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
    }
}
