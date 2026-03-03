import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural property tests for the monorepo package layout.
 *
 * These tests verify that every internal package under packages/
 * conforms to the JIT-package conventions defined in the design doc.
 */

const PACKAGES_DIR = path.resolve(import.meta.dirname, "../../../../packages");

/** Config-only packages that don't follow the standard library pattern */
const CONFIG_PACKAGES = ["typescript-config"];

/** Read all package directory names under packages/ */
function getPackageDirs(): string[] {
  return fs
    .readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "node_modules")
    .map((d) => d.name);
}

/** Read and parse a package's package.json */
function readPackageJson(pkgDir: string): Record<string, unknown> {
  const filePath = path.join(PACKAGES_DIR, pkgDir, "package.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/** Non-config packages that should follow the standard library pattern */
function getLibraryPackageDirs(): string[] {
  return getPackageDirs().filter((d) => !CONFIG_PACKAGES.includes(d));
}

/**
 * Property 4: JIT package exports point to TypeScript source
 *
 * For all internal packages under packages/, the exports field in
 * package.json maps subpaths directly to .ts source files (not
 * compiled .js output), enabling the JIT package pattern.
 *
 * Validates: Requirement 5.2
 */
describe("Property 4: JIT package exports point to TypeScript source", () => {
  const libraryPkgs = getLibraryPackageDirs();

  it.each(
    libraryPkgs
  )("packages/%s — exports point to .ts source files", (pkgDir) => {
    const pkg = readPackageJson(pkgDir);
    const exports = pkg.exports as Record<
      string,
      Record<string, string> | string
    >;

    expect(exports).toBeDefined();

    for (const [_subpath, target] of Object.entries(exports)) {
      if (typeof target === "string") {
        // Single string export (e.g. @portal/email "." → "./src/index.ts")
        expect(target).toMatch(/\.tsx?$/);
      } else if (typeof target === "object" && target !== null) {
        // Conditional export with types/default conditions
        for (const [_condition, value] of Object.entries(target)) {
          expect(value).toMatch(/\.tsx?$/);
        }
      }
    }
  });
});

/**
 * Property 5: Package structure conformance
 *
 * For all internal packages under packages/, the package.json sets
 * "private": true and declares a type-check script.
 * Note: check/fix scripts are not per-package — Ultracite runs from root.
 *
 * Validates: Requirements 5.6, 13.1
 */
describe("Property 5: Package structure conformance (private: true, scripts)", () => {
  const libraryPkgs = getLibraryPackageDirs();

  it.each(
    libraryPkgs
  )('packages/%s — package.json sets "private": true', (pkgDir) => {
    const pkg = readPackageJson(pkgDir);
    expect(pkg.private).toBe(true);
  });

  it.each(libraryPkgs)("packages/%s — declares type-check script", (pkgDir) => {
    const pkg = readPackageJson(pkgDir);
    const scripts = pkg.scripts as Record<string, string> | undefined;

    expect(scripts).toBeDefined();
    expect(scripts).toHaveProperty("type-check");
  });
});

/**
 * Property 6: TypeScript config inheritance
 *
 * For all internal packages under packages/ (excluding typescript-config),
 * tsconfig.json extends @portal/typescript-config/library.json.
 *
 * Validates: Requirements 3.4, 3.5
 */
describe("Property 6: TypeScript config inheritance (extends library.json)", () => {
  const libraryPkgs = getLibraryPackageDirs();

  it.each(
    libraryPkgs
  )("packages/%s — tsconfig.json extends @portal/typescript-config/library.json", (pkgDir) => {
    const tsconfigPath = path.join(PACKAGES_DIR, pkgDir, "tsconfig.json");
    expect(
      fs.existsSync(tsconfigPath),
      `tsconfig.json should exist in packages/${pkgDir}`
    ).toBe(true);

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    expect(tsconfig.extends).toBe("@portal/typescript-config/library.json");
  });
});

/**
 * Property 7: No barrel files in wildcard-export packages
 *
 * For all internal packages that use the wildcard export pattern ("./*"),
 * no index.ts barrel file exists in the package's src/ directory.
 *
 * Validates: Requirement 5.7
 */
describe("Property 7: No barrel files in wildcard-export packages", () => {
  const libraryPkgs = getLibraryPackageDirs();

  // Filter to only packages that use the wildcard export pattern
  const wildcardPkgs = libraryPkgs.filter((pkgDir) => {
    const pkg = readPackageJson(pkgDir);
    const exports = pkg.exports as Record<string, unknown> | undefined;
    return exports && "./*" in exports;
  });

  it.each(
    wildcardPkgs
  )("packages/%s — no index.ts barrel file in src/", (pkgDir) => {
    const indexPath = path.join(PACKAGES_DIR, pkgDir, "src", "index.ts");
    expect(
      fs.existsSync(indexPath),
      `packages/${pkgDir}/src/index.ts should not exist (barrel files are prohibited in wildcard-export packages)`
    ).toBe(false);
  });
});
