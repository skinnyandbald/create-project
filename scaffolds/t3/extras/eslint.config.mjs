/**
 * ESLint configuration for Next.js-specific rules only.
 * Biome handles formatting and general linting.
 *
 * This config enforces:
 * 1. Next.js best practices (Core Web Vitals, image optimization, App Router)
 *
 * Setup:
 * 1. npm install -D eslint @next/eslint-plugin-next
 * 2. Copy this file to your project root as eslint.config.mjs
 * 3. Add scripts to package.json:
 *    "lint": "biome check .",
 *    "lint:fix": "biome check --write .",
 *    "lint:next": "eslint"
 */
import nextPlugin from "@next/eslint-plugin-next";

export default [
  // Global ignores - only lint src/
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
];
