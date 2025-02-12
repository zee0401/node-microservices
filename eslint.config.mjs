import globals from "globals";
import pluginJs from "@eslint/js";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    {
        plugins: {
            import: importPlugin,
        },
        rules: {
            "no-console": "warn",
            "no-unused-vars": "warn",
            "import/no-unresolved": "error",
        },
    },
];
