import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const sharedConfig = {
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    globals: globals.browser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  },
};

export default tseslint.config(
  { ignores: ["dist"] },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx}"],
    ...sharedConfig,
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    ...sharedConfig,
    rules: {
      ...sharedConfig.rules,
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
