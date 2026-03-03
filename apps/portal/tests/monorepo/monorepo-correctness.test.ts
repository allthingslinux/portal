import fs from "node:fs";
import path from "node:path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

/**
 * Structural correctness property tests for the monorepo.
 *
 * Properties 1-3 and 8-11, 14 verify cross-cutting invariants:
 * dependency acyclicity, stale import absence, package boundary
 * enforcement, env var completeness, process.env isolation,
 * import path correctness, app-internal alias preservation,
 * and package dependency completeness.
 */

const ROOT_DIR = path.resolve(import.meta.dirname, "../../../..");
const PACKAGES_DIR = path.join(ROOT_DIR, "packages");
const APP_SRC_DIR = path.join(ROOT_DIR, "apps/portal/src");
const TURBO_JSON_PATH = path.join(ROOT_DIR, "turbo.json");

/** Config-only packages that don't have src/ directories */
const CONFIG_PACKAGES = ["typescript-config"];

/**
 * Packages that retain @/ app-internal imports by design.
 * These resolve through the consuming app's bundler at build time.
 * See design doc: "Some packages (@portal/seo, @portal/api, @portal/ui)
 * retain @/ app-internal imports that resolve through the app's bundler"
 */
const PACKAGES_WITH_APP_IMPORTS = new Set(["seo", "ui", "api"]);

/** Read all package directory names under packages/ */
function getPackageDirs(): string[] {
  return fs
    .readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "node_modules")
    .map((d) => d.name);
}

/** Non-config packages that have src/ directories */
function getLibraryPackageDirs(): string[] {
  return getPackageDirs().filter((d) => !CONFIG_PACKAGES.includes(d));
}

/** Read and parse a package's package.json */
function readPackageJson(pkgDir: string): Record<string, unknown> {
  const filePath = path.join(PACKAGES_DIR, pkgDir, "package.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/** Recursively collect all .ts/.tsx files under a directory */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      results.push(...collectSourceFiles(fullPath));
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Extract import specifiers from a source file's content */
function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex =
    /(?:import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\))/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const specifier = match[1] || match[2];
    if (specifier) {
      imports.push(specifier);
    }
  }
  return imports;
}

/**
 * Extract import specifiers excluding optional require() calls in try/catch.
 * Optional requires (wrapped in try/catch) are not real dependencies.
 */
function extractStrictImports(content: string): string[] {
  const imports: string[] = [];
  // Only match ES import statements, not require()
  const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) {
      imports.push(match[1]);
    }
  }
  return imports;
}

/** Strip single-line and multi-line comments from source content */
function stripComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

/**
 * Property 1: Dependency acyclicity
 *
 * For all pairs of internal packages (A, B) in the workspace, if A
 * declares B as a dependency, then B does not transitively depend on A.
 * The package dependency graph is a directed acyclic graph (DAG).
 *
 * Validates: Requirements 5.5, 14.1
 */
describe("Property 1: Dependency acyclicity", () => {
  function buildDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const pkgDir of getPackageDirs()) {
      const pkg = readPackageJson(pkgDir);
      const name = pkg.name as string;
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
      };
      const portalDeps = Object.keys(deps).filter((d) =>
        d.startsWith("@portal/")
      );
      graph.set(name, portalDeps);
    }
    return graph;
  }

  function findCycle(graph: Map<string, string[]>): string[] | null {
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const trail: string[] = [];

    function dfs(node: string): string[] | null {
      if (inStack.has(node)) {
        const cycleStart = trail.indexOf(node);
        return [...trail.slice(cycleStart), node];
      }
      if (visited.has(node)) {
        return null;
      }

      visited.add(node);
      inStack.add(node);
      trail.push(node);

      for (const dep of graph.get(node) ?? []) {
        const cycle = dfs(dep);
        if (cycle) {
          return cycle;
        }
      }

      trail.pop();
      inStack.delete(node);
      return null;
    }

    for (const node of graph.keys()) {
      const cycle = dfs(node);
      if (cycle) {
        return cycle;
      }
    }
    return null;
  }

  it("package dependency graph is a DAG with no cycles", () => {
    const graph = buildDependencyGraph();
    const cycle = findCycle(graph);
    expect(
      cycle,
      cycle ? `Circular dependency detected: ${cycle.join(" -> ")}` : ""
    ).toBeNull();
  });

  it("property: for any random package, its transitive deps never include itself", () => {
    const graph = buildDependencyGraph();
    const packageNames = [...graph.keys()];

    function getTransitiveDeps(
      pkg: string,
      seen = new Set<string>()
    ): Set<string> {
      for (const dep of graph.get(pkg) ?? []) {
        if (!seen.has(dep)) {
          seen.add(dep);
          getTransitiveDeps(dep, seen);
        }
      }
      return seen;
    }

    fc.assert(
      fc.property(fc.constantFrom(...packageNames), (pkg) => {
        const transitiveDeps = getTransitiveDeps(pkg);
        return !transitiveDeps.has(pkg);
      }),
      { numRuns: packageNames.length * 3 }
    );
  });
});

/**
 * Property 2: No stale imports remain
 *
 * For all source files in the codebase (app and packages), no import
 * statement references the old @/shared/*, @/components/*, @/db, or
 * @/ui/* patterns that have been migrated to @portal/* package imports.
 *
 * Validates: Requirements 6.1, 6.4, 6.5
 */
describe("Property 2: No stale imports remain", () => {
  const STALE_PATTERNS = [
    /from\s+["']@\/shared\/types/,
    /from\s+["']@\/shared\/utils/,
    /from\s+["']@\/shared\/schemas/,
    /from\s+["']@\/shared\/db/,
    /from\s+["']@\/shared\/api/,
    /from\s+["']@\/shared\/email/,
    /from\s+["']@\/shared\/observability/,
    /from\s+["']@\/shared\/seo/,
    /from\s+["']@\/components\//,
    /from\s+["']@\/db["'/]/,
    /from\s+["']@\/ui\//,
  ];

  function getAllSourceFiles(): string[] {
    const files: string[] = [];
    files.push(...collectSourceFiles(APP_SRC_DIR));
    for (const pkgDir of getLibraryPackageDirs()) {
      files.push(...collectSourceFiles(path.join(PACKAGES_DIR, pkgDir, "src")));
    }
    return files;
  }

  it("no source file contains stale @/shared/*, @/components/*, @/db, or @/ui/* imports", () => {
    const sourceFiles = getAllSourceFiles();
    const violations: { file: string; line: string; pattern: string }[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (const line of lines) {
        for (const pattern of STALE_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(ROOT_DIR, file),
              line: line.trim(),
              pattern: pattern.source,
            });
          }
        }
      }
    }

    expect(
      violations,
      `Found ${violations.length} stale import(s):\n${violations
        .map((v) => `  ${v.file}: ${v.line}`)
        .join("\n")}`
    ).toHaveLength(0);
  });

  it("property: random source files contain no stale import patterns", () => {
    const sourceFiles = getAllSourceFiles();
    if (sourceFiles.length === 0) {
      return;
    }

    fc.assert(
      fc.property(fc.constantFrom(...sourceFiles), (file) => {
        const content = fs.readFileSync(file, "utf-8");
        return STALE_PATTERNS.every((p) => !p.test(content));
      }),
      { numRuns: Math.min(sourceFiles.length, 100) }
    );
  });
});

/**
 * Property 3: Package boundary enforcement
 *
 * For all source files in packages/star/src/, no import uses the @/
 * app-internal alias, and no import references another internal package
 * via a direct relative file path. All cross-package imports go through
 * @portal/* package exports.
 *
 * Note: Some packages (seo, ui, api) retain @/ app-internal imports that
 * resolve through the app's bundler. These are documented architectural
 * decisions and are excluded from the @/ alias check.
 *
 * Validates: Requirements 13.2, 13.3
 */
describe("Property 3: Package boundary enforcement", () => {
  /** Collect source files from packages with strict boundaries (no @/ allowed) */
  function getStrictPackageSourceFiles(): {
    pkgDir: string;
    file: string;
  }[] {
    const results: { pkgDir: string; file: string }[] = [];
    for (const pkgDir of getLibraryPackageDirs()) {
      if (PACKAGES_WITH_APP_IMPORTS.has(pkgDir)) {
        continue;
      }
      const srcDir = path.join(PACKAGES_DIR, pkgDir, "src");
      for (const file of collectSourceFiles(srcDir)) {
        results.push({ pkgDir, file });
      }
    }
    return results;
  }

  /** Collect all source files from all library packages */
  function getAllPackageSourceFiles(): {
    pkgDir: string;
    file: string;
  }[] {
    const results: { pkgDir: string; file: string }[] = [];
    for (const pkgDir of getLibraryPackageDirs()) {
      const srcDir = path.join(PACKAGES_DIR, pkgDir, "src");
      for (const file of collectSourceFiles(srcDir)) {
        results.push({ pkgDir, file });
      }
    }
    return results;
  }

  it("strict packages do not use @/ app-internal alias", () => {
    const files = getStrictPackageSourceFiles();
    const violations: { pkg: string; file: string; line: string }[] = [];

    for (const { pkgDir, file } of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        if (/(?:from|import)\s+["']@\//.test(line)) {
          violations.push({
            pkg: pkgDir,
            file: path.relative(ROOT_DIR, file),
            line: line.trim(),
          });
        }
      }
    }

    expect(
      violations,
      `Found ${violations.length} @/ alias usage(s) in strict packages:\n${violations
        .map((v) => `  ${v.file}: ${v.line}`)
        .join("\n")}`
    ).toHaveLength(0);
  });

  it("no package source file uses relative cross-package paths", () => {
    const files = getAllPackageSourceFiles();
    const violations: { pkg: string; file: string; line: string }[] = [];

    for (const { pkgDir, file } of files) {
      const content = fs.readFileSync(file, "utf-8");
      const imports = extractImports(content);
      for (const imp of imports) {
        if (imp.startsWith("../") || imp.startsWith("../../")) {
          const resolved = path.resolve(path.dirname(file), imp);
          const pkgSrcDir = path.join(PACKAGES_DIR, pkgDir, "src");
          if (!resolved.startsWith(pkgSrcDir)) {
            violations.push({
              pkg: pkgDir,
              file: path.relative(ROOT_DIR, file),
              line: imp,
            });
          }
        }
      }
    }

    expect(
      violations,
      `Found ${violations.length} cross-package relative import(s):\n${violations
        .map((v) => `  ${v.file}: ${v.line}`)
        .join("\n")}`
    ).toHaveLength(0);
  });

  it("property: random strict-boundary package files respect package boundaries", () => {
    const files = getStrictPackageSourceFiles();
    if (files.length === 0) {
      return;
    }

    fc.assert(
      fc.property(fc.constantFrom(...files), ({ pkgDir, file }) => {
        const content = fs.readFileSync(file, "utf-8");
        if (/(?:from|import)\s+["']@\//.test(content)) {
          return false;
        }
        const imports = extractImports(content);
        const pkgSrcDir = path.join(PACKAGES_DIR, pkgDir, "src");
        for (const imp of imports) {
          if (imp.startsWith("../")) {
            const resolved = path.resolve(path.dirname(file), imp);
            if (!resolved.startsWith(pkgSrcDir)) {
              return false;
            }
          }
        }
        return true;
      }),
      { numRuns: Math.min(files.length, 100) }
    );
  });
});

/**
 * Property 8: Environment variable completeness
 *
 * For all environment variables referenced in keys.ts files across all
 * packages, the variable appears in the corresponding task's env array
 * in turbo.json (or in globalEnv). No undeclared env var silently
 * affects build output.
 *
 * Validates: Requirements 2.4, 12.2, 13.4
 */
describe("Property 8: Environment variable completeness", () => {
  /** Extract env var names from a keys.ts file's runtimeEnv block */
  function extractEnvVarsFromKeysFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, "utf-8");
    const vars: string[] = [];
    const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    let match: RegExpExecArray | null;
    while ((match = processEnvRegex.exec(content)) !== null) {
      if (match[1]) {
        vars.push(match[1]);
      }
    }
    return vars;
  }

  /** Find all keys.ts files in packages */
  function findPackageKeysFiles(): string[] {
    const keysFiles: string[] = [];
    for (const pkgDir of getLibraryPackageDirs()) {
      const keysPath = path.join(PACKAGES_DIR, pkgDir, "src", "keys.ts");
      if (fs.existsSync(keysPath)) {
        keysFiles.push(keysPath);
      }
    }
    return keysFiles;
  }

  /** Get all declared env vars from turbo.json (all task env + globalEnv) */
  function getTurboEnvVars(): { exact: Set<string>; wildcards: string[] } {
    const turboJson = JSON.parse(fs.readFileSync(TURBO_JSON_PATH, "utf-8"));
    const exact = new Set<string>();
    const wildcards: string[] = [];

    for (const v of (turboJson.globalEnv ?? []) as string[]) {
      if (v.includes("*")) {
        wildcards.push(v);
      } else {
        exact.add(v);
      }
    }

    for (const task of Object.values(turboJson.tasks ?? {}) as Record<
      string,
      unknown
    >[]) {
      for (const v of (task.env ?? []) as string[]) {
        if (v.includes("*")) {
          wildcards.push(v);
        } else {
          exact.add(v);
        }
      }
    }

    return { exact, wildcards };
  }

  function isEnvVarDeclared(
    varName: string,
    turboEnv: { exact: Set<string>; wildcards: string[] }
  ): boolean {
    if (turboEnv.exact.has(varName)) {
      return true;
    }
    for (const wc of turboEnv.wildcards) {
      const prefix = wc.replace("*", "");
      if (varName.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }

  it("all env vars in package keys.ts files appear in turbo.json env arrays", () => {
    const keysFiles = findPackageKeysFiles();
    const turboEnv = getTurboEnvVars();
    const undeclared: { file: string; varName: string }[] = [];

    for (const keysFile of keysFiles) {
      const vars = extractEnvVarsFromKeysFile(keysFile);
      for (const varName of vars) {
        if (!isEnvVarDeclared(varName, turboEnv)) {
          undeclared.push({
            file: path.relative(ROOT_DIR, keysFile),
            varName,
          });
        }
      }
    }

    expect(
      undeclared,
      `Found ${undeclared.length} undeclared env var(s) in turbo.json:\n${undeclared
        .map((u) => `  ${u.file}: ${u.varName}`)
        .join("\n")}`
    ).toHaveLength(0);
  });
});

/**
 * Property 9: No direct process.env access in packages
 *
 * For all source files in packages that use @t3-oss/env-nextjs for
 * environment validation, no file other than keys.ts contains a direct
 * process.env reference in executable code (comments excluded).
 *
 * Note: process.env.NODE_ENV is excluded as it is a standard runtime
 * check injected by bundlers and declared in turbo.json globalEnv.
 * The observability package is excluded because it reads many runtime
 * env vars for telemetry metadata (BUILD_ID, GIT_HASH, AWS_REGION, etc.)
 * that are not build-time vars managed through keys.ts.
 *
 * Validates: Requirement 12.5
 */
describe("Property 9: No direct process.env access in packages", () => {
  /**
   * Packages excluded from this check:
   * - observability: reads many runtime env vars for telemetry metadata
   *   (BUILD_ID, GIT_HASH, AWS_REGION, SENTRY_RELEASE, etc.) that are
   *   not build-time vars and don't belong in keys.ts
   */
  const PROCESS_ENV_EXEMPT_PACKAGES = new Set(["observability"]);

  function getPackagesWithKeys(): string[] {
    return getLibraryPackageDirs().filter((pkgDir) => {
      if (PROCESS_ENV_EXEMPT_PACKAGES.has(pkgDir)) {
        return false;
      }
      const keysPath = path.join(PACKAGES_DIR, pkgDir, "src", "keys.ts");
      return fs.existsSync(keysPath);
    });
  }

  /**
   * Check if a line has a real process.env access (not in a comment,
   * and not process.env.NODE_ENV which is a standard bundler-injected check).
   */
  function hasRealProcessEnvAccess(line: string): boolean {
    const trimmed = line.trim();
    // Skip comment lines
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
      return false;
    }
    // Skip process.env.NODE_ENV (standard runtime check, in globalEnv)
    if (/process\.env\.NODE_ENV\b/.test(trimmed)) {
      // Only flag if there's ANOTHER process.env on the same line
      const withoutNodeEnv = trimmed.replace(/process\.env\.NODE_ENV\b/g, "");
      return /process\.env\b/.test(withoutNodeEnv);
    }
    return /process\.env\b/.test(trimmed);
  }

  it("no file other than keys.ts in env-validated packages contains process.env (excluding NODE_ENV and comments)", () => {
    const pkgsWithKeys = getPackagesWithKeys();
    const violations: { pkg: string; file: string; line: string }[] = [];

    for (const pkgDir of pkgsWithKeys) {
      const srcDir = path.join(PACKAGES_DIR, pkgDir, "src");
      const files = collectSourceFiles(srcDir);

      for (const file of files) {
        if (path.basename(file) === "keys.ts") {
          continue;
        }
        // Skip config.ts in db package (drizzle-kit config runs outside Next.js)
        if (pkgDir === "db" && path.basename(file) === "config.ts") {
          continue;
        }

        const content = fs.readFileSync(file, "utf-8");
        const strippedContent = stripComments(content);
        const lines = strippedContent.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (hasRealProcessEnvAccess(lines[i]!)) {
            violations.push({
              pkg: pkgDir,
              file: path.relative(ROOT_DIR, file),
              line: `L${i + 1}: ${lines[i]?.trim()}`,
            });
          }
        }
      }
    }

    expect(
      violations,
      `Found ${violations.length} direct process.env access(es) outside keys.ts:\n${violations
        .map((v) => `  ${v.file} ${v.line}`)
        .join("\n")}`
    ).toHaveLength(0);
  });

  it("property: random non-keys.ts files in env-validated packages have no process.env (excluding NODE_ENV)", () => {
    const pkgsWithKeys = getPackagesWithKeys();
    const nonKeysFiles: string[] = [];

    for (const pkgDir of pkgsWithKeys) {
      const srcDir = path.join(PACKAGES_DIR, pkgDir, "src");
      for (const file of collectSourceFiles(srcDir)) {
        if (path.basename(file) === "keys.ts") {
          continue;
        }
        if (pkgDir === "db" && path.basename(file) === "config.ts") {
          continue;
        }
        nonKeysFiles.push(file);
      }
    }

    if (nonKeysFiles.length === 0) {
      return;
    }

    fc.assert(
      fc.property(fc.constantFrom(...nonKeysFiles), (file) => {
        const content = fs.readFileSync(file, "utf-8");
        const stripped = stripComments(content);
        const lines = stripped.split("\n");
        return lines.every((line) => !hasRealProcessEnvAccess(line));
      }),
      { numRuns: Math.min(nonKeysFiles.length, 50) }
    );
  });
});

/**
 * Property 10: Import path correctness
 *
 * For all @portal/* imports in the codebase, the import uses a direct
 * subpath (e.g., @portal/utils/constants) rather than a bare package
 * name, except for @portal/email which is a single-file module.
 *
 * Validates: Requirement 6.2
 */
describe("Property 10: Import path correctness", () => {
  const BARE_IMPORT_ALLOWED = ["@portal/email"];
  const CONFIG_PACKAGE_IMPORTS = ["@portal/typescript-config"];

  function getAllSourceFiles(): string[] {
    const files: string[] = [];
    files.push(...collectSourceFiles(APP_SRC_DIR));
    for (const pkgDir of getLibraryPackageDirs()) {
      files.push(...collectSourceFiles(path.join(PACKAGES_DIR, pkgDir, "src")));
    }
    return files;
  }

  it("all @portal/* imports use direct subpaths (except @portal/email)", () => {
    const sourceFiles = getAllSourceFiles();
    const violations: { file: string; importPath: string }[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const imports = extractImports(content);

      for (const imp of imports) {
        if (!imp.startsWith("@portal/")) {
          continue;
        }
        if (CONFIG_PACKAGE_IMPORTS.some((cp) => imp.startsWith(cp))) {
          continue;
        }
        if (BARE_IMPORT_ALLOWED.includes(imp)) {
          continue;
        }

        // @portal/X has 2 parts, @portal/X/subpath has 3+
        const parts = imp.split("/");
        if (parts.length <= 2) {
          violations.push({
            file: path.relative(ROOT_DIR, file),
            importPath: imp,
          });
        }
      }
    }

    expect(
      violations,
      `Found ${violations.length} bare @portal/* import(s) missing subpath:\n${violations
        .map((v) => `  ${v.file}: import "${v.importPath}"`)
        .join("\n")}`
    ).toHaveLength(0);
  });

  it("property: random source files use correct @portal/* import subpaths", () => {
    const sourceFiles = getAllSourceFiles();
    if (sourceFiles.length === 0) {
      return;
    }

    fc.assert(
      fc.property(fc.constantFrom(...sourceFiles), (file) => {
        const content = fs.readFileSync(file, "utf-8");
        const imports = extractImports(content);
        for (const imp of imports) {
          if (!imp.startsWith("@portal/")) {
            continue;
          }
          if (CONFIG_PACKAGE_IMPORTS.some((cp) => imp.startsWith(cp))) {
            continue;
          }
          if (BARE_IMPORT_ALLOWED.includes(imp)) {
            continue;
          }
          if (imp.split("/").length <= 2) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: Math.min(sourceFiles.length, 100) }
    );
  });
});

/**
 * Property 11: App-internal alias preservation
 *
 * For all imports of @/auth, @/features/*, @/hooks/*, @/config, and
 * @/env in the Portal App source, the @/ prefix is preserved (not
 * rewritten to a @portal/* import).
 *
 * Validates: Requirement 6.3
 */
describe("Property 11: App-internal alias preservation", () => {
  const APP_INTERNAL_PATTERNS = [
    "@/auth",
    "@/features/",
    "@/hooks/",
    "@/config",
    "@/env",
  ];

  it("app-internal @/ imports are preserved and not rewritten to @portal/*", () => {
    const appFiles = collectSourceFiles(APP_SRC_DIR);
    let foundAppInternalImports = false;

    for (const file of appFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const imports = extractImports(content);

      for (const imp of imports) {
        if (APP_INTERNAL_PATTERNS.some((p) => imp.startsWith(p))) {
          foundAppInternalImports = true;
          expect(imp).not.toMatch(/^@portal\//);
        }
      }
    }

    expect(
      foundAppInternalImports,
      "Expected to find at least one app-internal @/ import in the app source"
    ).toBe(true);
  });

  it("property: random app source files preserve @/ for app-internal modules", () => {
    const appFiles = collectSourceFiles(APP_SRC_DIR);
    if (appFiles.length === 0) {
      return;
    }

    fc.assert(
      fc.property(fc.constantFrom(...appFiles), (file) => {
        const content = fs.readFileSync(file, "utf-8");
        const imports = extractImports(content);
        for (const imp of imports) {
          for (const pattern of APP_INTERNAL_PATTERNS) {
            const portalEquivalent = pattern.replace("@/", "@portal/");
            if (imp.startsWith(portalEquivalent)) {
              return false;
            }
          }
        }
        return true;
      }),
      { numRuns: Math.min(appFiles.length, 100) }
    );
  });
});

/**
 * Property 14: Package dependency completeness
 *
 * For all internal packages, every runtime import in the package's source
 * files resolves to either the package's own files, a declared dependency
 * in the package's package.json, or a Node.js built-in module.
 *
 * Note: Packages that retain @/ app-internal imports (seo, ui, api) are
 * excluded from the @/ import check since those resolve through the app
 * bundler, not through the package's own dependencies.
 *
 * Validates: Requirement 5.4
 */
describe("Property 14: Package dependency completeness", () => {
  const NODE_BUILTINS = new Set([
    "assert",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "http2",
    "https",
    "inspector",
    "module",
    "net",
    "os",
    "path",
    "perf_hooks",
    "process",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "stream",
    "string_decoder",
    "sys",
    "timers",
    "tls",
    "trace_events",
    "tty",
    "url",
    "util",
    "v8",
    "vm",
    "wasi",
    "worker_threads",
    "zlib",
  ]);

  function isNodeBuiltin(specifier: string): boolean {
    const bare = specifier.replace(/^node:/, "");
    return NODE_BUILTINS.has(bare);
  }

  function getPackageName(specifier: string): string | null {
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      return null;
    }
    if (isNodeBuiltin(specifier)) {
      return null;
    }

    if (specifier.startsWith("@")) {
      const parts = specifier.split("/");
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
      return specifier;
    }

    return specifier.split("/")[0]!;
  }

  it.each(
    getLibraryPackageDirs()
  )("packages/%s - all runtime imports resolve to declared dependencies", (pkgDir) => {
    const pkg = readPackageJson(pkgDir);
    const declaredDeps = new Set<string>([
      ...Object.keys((pkg.dependencies ?? {}) as Record<string, string>),
      ...Object.keys((pkg.devDependencies ?? {}) as Record<string, string>),
      ...Object.keys((pkg.peerDependencies ?? {}) as Record<string, string>),
    ]);

    // For packages that retain @/ app imports, also include the app's
    // dependencies since they resolve through the app's bundler
    if (PACKAGES_WITH_APP_IMPORTS.has(pkgDir)) {
      const appPkgPath = path.join(ROOT_DIR, "apps/portal/package.json");
      const appPkg = JSON.parse(fs.readFileSync(appPkgPath, "utf-8"));
      for (const dep of Object.keys(
        (appPkg.dependencies ?? {}) as Record<string, string>
      )) {
        declaredDeps.add(dep);
      }
      for (const dep of Object.keys(
        (appPkg.devDependencies ?? {}) as Record<string, string>
      )) {
        declaredDeps.add(dep);
      }
    }

    const srcDir = path.join(PACKAGES_DIR, pkgDir, "src");
    const files = collectSourceFiles(srcDir);
    const undeclared: { file: string; importPkg: string }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      // Use strict imports (ES only) to skip optional require() in try/catch
      const imports = extractStrictImports(content);

      for (const imp of imports) {
        // Skip @/ app-internal imports for packages that retain them
        if (imp.startsWith("@/") && PACKAGES_WITH_APP_IMPORTS.has(pkgDir)) {
          continue;
        }

        const importPkg = getPackageName(imp);
        if (importPkg === null) {
          continue;
        }
        if (importPkg === pkg.name) {
          continue;
        }

        if (!declaredDeps.has(importPkg)) {
          undeclared.push({
            file: path.relative(ROOT_DIR, file),
            importPkg,
          });
        }
      }
    }

    expect(
      undeclared,
      `Found ${undeclared.length} undeclared dependency import(s) in ${pkgDir}:\n${undeclared
        .map((u) => `  ${u.file}: "${u.importPkg}"`)
        .join("\n")}`
    ).toHaveLength(0);
  });
});
