import globals from "globals";
import pluginJs from "@eslint/js";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    },
    pluginJs.configs.recommended,
    {
        plugins: {
            import: importPlugin,
        },
        settings: {
            "import/resolver": {
                node: {
                    extensions: [".js", ".json", ".mjs", ".cjs"],
                    moduleDirectory: ["node_modules", "../"],
                },
            },
        },
        rules: {
            "no-console": "warn",
            "no-unused-vars": "warn",
            "import/no-unresolved": "error",
        },
    },
];
