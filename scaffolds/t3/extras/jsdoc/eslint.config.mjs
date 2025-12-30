/**
 * ESLint configuration for JSDoc enforcement only.
 * Biome handles formatting and general linting.
 * This config enforces documentation presence on public APIs.
 *
 * Setup:
 * 1. npm install -D eslint eslint-plugin-jsdoc @typescript-eslint/parser
 * 2. Copy this file to your project root
 * 3. Add scripts to package.json:
 *    "lint:docs": "eslint --max-warnings 0",
 *    "lint:docs:fix": "eslint --fix"
 */
import jsdoc from "eslint-plugin-jsdoc";
import tsParser from "@typescript-eslint/parser";

export default [
  // Global ignores (build artifacts, node_modules, etc.)
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "generated/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },

  // Apply JSDoc recommended rules for TypeScript
  jsdoc.configs["flat/recommended-typescript-error"],

  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.d.ts",
      "**/generated/**",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { jsdoc },
    rules: {
      // Require JSDoc on public exports
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false, // Too noisy for inline callbacks
            FunctionExpression: false,
          },
          contexts: [
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSEnumDeclaration",
          ],
        },
      ],

      // Require meaningful descriptions
      "jsdoc/require-description": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",

      // Don't require @param/@returns when TypeScript provides types
      // (reduces redundancy with TS type annotations)
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",

      // Validate existing JSDoc is correct
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/valid-types": "error",
    },
  },

  // Stricter rules for server-side code (tRPC routers, API routes)
  {
    files: ["src/server/**/*.ts", "src/app/api/**/*.ts"],
    rules: {
      "jsdoc/require-jsdoc": [
        "error", // Error instead of warn for server code
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
          contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration"],
        },
      ],
    },
  },
];
