module.exports = {
  root: true,
  parserOptions: {
    tsconfigRootDir: __dirname
  },
  extends: ["prettier"],
  overrides: [
    {
      files: ["apps/main-app/**/*.{ts,tsx}"],
      extends: ["next", "next/core-web-vitals", "prettier"]
    },
    {
      files: ["apps/auth-service/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./apps/auth-service/tsconfig.json"
      },
      env: {
        es2021: true,
        node: true
      },
      extends: ["plugin:@typescript-eslint/recommended", "prettier"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    },
    {
      files: ["packages/db/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./packages/db/tsconfig.json"
      },
      env: { es2021: true, node: true },
      extends: ["plugin:@typescript-eslint/recommended", "prettier"]
    }
  ]
};
