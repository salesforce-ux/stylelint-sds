import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
//import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js", // Entry point of your package
  output: [
    {
      file: "dist/index.js", // Output file for the single bundle
      format: "cjs", // CommonJS format (use "esm" for ES Modules if preferred)
      sourcemap: true, // Generate a source map
    },
  ],
  plugins: [
    resolve(), // Resolve Node.js-style imports (from node_modules)
    commonjs(), // Convert CommonJS to ES modules
    //terser(), // Minify the output for production
  ],
};