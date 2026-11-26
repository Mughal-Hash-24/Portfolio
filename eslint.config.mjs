import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "games/**",
    "next-env.d.ts",
    ".commandcode/**",
    // Compiled game bundles: Emscripten and pygbag emit their own runtime JS.
    "public/arcade/**",
    "public/arcade-runtime/**",
  ]),
]);

export default eslintConfig;
