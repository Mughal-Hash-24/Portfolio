/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
};

export default config;
