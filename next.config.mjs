import path from "node:path";
import { fileURLToPath } from "node:url";

const disabledPackages = ["pino-pretty", "lokijs", "encoding"];
const isTurbopack = Boolean(process.env.TURBOPACK);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModuleAbsolutePath = path.join(__dirname, "lib", "empty-module.ts");

const turbopackAliases = disabledPackages.reduce((aliases, pkg) => {
  aliases[pkg] = "./lib/empty-module.ts";
  return aliases;
}, {});

const webpackAliases = disabledPackages.reduce((aliases, pkg) => {
  aliases[pkg] = emptyModuleAbsolutePath;
  return aliases;
}, {});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: turbopackAliases,
  },
};

if (!isTurbopack) {
  nextConfig.webpack = (config) => {
    config.externals.push(...disabledPackages);
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...webpackAliases,
    };

    return config;
  };
}

export default nextConfig;
