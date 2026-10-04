import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import boundariesPlugin from "eslint-plugin-boundaries";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export const scrappyEslintConfig = [
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/.turbo/**", "**/coverage/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      boundaries: boundariesPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "boundaries/elements": [
        {
          type: "app",
          pattern: "apps/*",
        },
        {
          type: "adapter",
          pattern: "packages/adapters/*",
        },
        {
          type: "core",
          pattern: "packages/core/*",
        },
        {
          type: "scraping",
          pattern: "packages/scraping/*",
        },
        {
          type: "package",
          pattern: "packages/*",
        },
      ],
    },
    rules: {
      // TypeScript Strict
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // Architecture Boundary Rules
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "package",
              disallow: ["app"],
              message: "Packages must not import from apps.",
            },
            {
              from: "adapter",
              allow: ["core", "scraping"],
              disallow: ["app", "package"],
              message: "Adapters may only depend on /scraping and /core.",
            },
          ],
        },
      ],
    },
  },
];

export default scrappyEslintConfig;
