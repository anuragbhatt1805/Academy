import { build } from "esbuild";
import { builtinModules } from "module";

await build({
  entryPoints: ["index.js"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",

  outfile: "dist/index.js",

  // 🔥 CRITICAL FIX
  external: [
    ...builtinModules, // fs, path, crypto, etc
    ...builtinModules.map((m) => `node:${m}`),
    ...Object.keys(
      JSON.parse(
        await import("fs/promises").then((m) =>
          m.readFile("package.json", "utf-8"),
        ),
      ).dependencies || {},
    ),
  ],

  minify: true,
  treeShaking: true,
  drop: ["console", "debugger"],

  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("✅ Build completed (node_modules externalized)");
