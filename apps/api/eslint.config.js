import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "src/migrations", "src/seeders", "**/*.cjs"] },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
