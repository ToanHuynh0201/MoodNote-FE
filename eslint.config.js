// @ts-check

const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const prettierPlugin = require("eslint-plugin-prettier");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	{
		ignores: [
			"node_modules/**",
			".expo/**",
			"dist/**",
			"build/**",
			"babel.config.js",
			"metro.config.js",
		],
	},
	{
		files: ["src/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			react: reactPlugin,
			"react-hooks": reactHooksPlugin,
			prettier: prettierPlugin,
		},
		settings: {
			react: { version: "detect" },
		},
		rules: {
			// TypeScript
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

			// React
			"react/react-in-jsx-scope": "off", // React 17+ JSX transform
			"react/prop-types": "off", // TypeScript handles this

			// React Hooks
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",

			// Prettier
			"prettier/prettier": "error",

			// General
			"no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},
];
