/**
 * ESLint configuration with JSDoc enforcement + Next.js rules.
 * Biome handles formatting and general linting.
 *
 * This config enforces:
 * 1. Next.js best practices (Core Web Vitals, image optimization, App Router)
 * 2. JSDoc documentation on public APIs
 *
 * Setup:
 * 1. npm install -D eslint @next/eslint-plugin-next eslint-plugin-jsdoc @typescript-eslint/parser
 * 2. Copy this file to your project root as eslint.config.mjs
 * 3. Add scripts to package.json:
 *    "lint": "biome check .",
 *    "lint:fix": "biome check --write .",
 *    "lint:next": "eslint",
 *    "lint:docs": "eslint --max-warnings 0",
 *    "lint:docs:fix": "eslint --fix"
 */
import nextPlugin from "@next/eslint-plugin-next";
import jsdoc from "eslint-plugin-jsdoc";
import tsParser from "@typescript-eslint/parser";

export default [
  // Global ignores - only lint src/ (excluding tests)
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "dist/**",
      ".prisma/**",
      "prisma/**",
      "src/generated/**",
      "src/__tests__/**",
      ".vercel/**",
      ".cache/**",
      ".turbo/**",
      "scripts/**",
      "tests/**",
      "public/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
    ],
  },

  // Next.js best practices (Core Web Vitals, image optimization, App Router patterns)
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // Global linter options
  {
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },

  // JSDoc enforcement for source files (excluding tests)
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: [
      "src/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.stories.ts",
      "**/*.stories.tsx",
      "**/*.d.ts",
      "**/generated/**",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
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
            ArrowFunctionExpression: false,
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
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",

      // Validate existing JSDoc is correct
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "warn",
      "jsdoc/valid-types": "warn",
    },
  },

  // Stricter JSDoc for server-side code
  {
    files: ["src/app/api/**/*.ts", "src/lib/**/*.ts", "src/server/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-jsdoc": [
        "warn",
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
