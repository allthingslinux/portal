import { z } from 'zod';

import { KeystaticStorage } from './keystatic-storage';
import { keyStaticConfig } from './keystatic.config';

/**
 * @name createKeystaticReader
 * @description Creates a new Keystatic reader instance.
 */
export async function createKeystaticReader() {
  switch (KeystaticStorage.kind) {
    case 'local': {
      // we need to import this dynamically to avoid parsing the package in edge environments
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { createReader } = await import('@keystatic/core/reader');

        return createReader(process.cwd(), keyStaticConfig);
      } else {
        // we should never get here but the compiler requires the check
        // to ensure we don't parse the package at build time
        throw new Error();
      }
    }

    case 'github':
    case 'cloud': {
      const { createGitHubReader } = await import(
        '@keystatic/core/reader/github'
      );

      return createGitHubReader(
        keyStaticConfig,
        getKeystaticGithubConfiguration(),
      );
    }

    default:
      throw new Error(`Unknown storage kind`);
  }
}

function getKeystaticGithubConfiguration() {
  /**
   * @description The repository to use for the GitHub storage.
   * This can be provided through the `NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO` environment variable. The previous environment variable `KEYSTATIC_STORAGE_REPO` is deprecated.
   */
  const repo =
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO ??
    /* @deprecated */
    process.env.KEYSTATIC_STORAGE_REPO;

  return z
    .object({
      token: z.string({
        description:
          'The GitHub token to use for authentication. Please provide the value through the "KEYSTATIC_GITHUB_TOKEN" environment variable.',
      }),
      repo: z.custom<`${string}/${string}`>(),
      pathPrefix: z.string().optional(),
    })
    .parse({
      token: process.env.KEYSTATIC_GITHUB_TOKEN,
      repo,
      pathPrefix: process.env.KEYSTATIC_PATH_PREFIX,
    });
}
