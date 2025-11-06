import { CloudConfig, GitHubConfig, LocalConfig } from '@keystatic/core';
import { z } from 'zod';

type ZodOutputFor<T> = z.ZodType<T, z.ZodTypeDef, unknown>;

/**
 * @name STORAGE_KIND
 * @description The kind of storage to use for the Keystatic reader.
 *
 * This can be provided through the `KEYSTATIC_STORAGE_KIND` environment variable or 'NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND'.
 * The previous environment variable `KEYSTATIC_STORAGE_KIND` is deprecated - as Keystatic may need this to be available in the client-side.
 *
 */
const STORAGE_KIND =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND ??
  /* @deprecated */
  process.env.KEYSTATIC_STORAGE_KIND ??
  'local';

/**
 * @name REPO
 * @description The repository to use for the GitHub storage.
 * This can be provided through the `NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO` environment variable. The previous environment variable `KEYSTATIC_STORAGE_REPO` is deprecated.
 */
const REPO =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_REPO ??
  /* @deprecated */
  process.env.KEYSTATIC_STORAGE_REPO;

const BRANCH_PREFIX = process.env.KEYSTATIC_STORAGE_BRANCH_PREFIX;
const PATH_PREFIX = process.env.KEYSTATIC_PATH_PREFIX;
const PROJECT = process.env.KEYSTATIC_STORAGE_PROJECT;

/**
 * @name local
 * @description The configuration for the local storage.
 */
const local = z.object({
  kind: z.literal('local'),
}) satisfies ZodOutputFor<LocalConfig['storage']>;

/**
 * @name cloud
 * @description The configuration for the cloud storage.
 */
const cloud = z.object({
  kind: z.literal('cloud'),
  project: z
    .string({
      description: `The Keystatic Cloud project. Please provide the value through the "KEYSTATIC_STORAGE_PROJECT" environment variable.`,
    })
    .min(1),
  branchPrefix: z.string().optional(),
  pathPrefix: z.string().optional(),
}) satisfies ZodOutputFor<CloudConfig['storage']>;

/**
 * @name github
 * @description The configuration for the GitHub storage.
 */
const github = z.object({
  kind: z.literal('github'),
  repo: z.custom<`${string}/${string}`>(),
  branchPrefix: z.string().optional(),
  pathPrefix: z.string().optional(),
}) satisfies ZodOutputFor<GitHubConfig['storage']>;

/**
 * @name KeystaticStorage
 * @description The configuration for the Keystatic storage. This is used to determine where the content is stored.
 * This configuration is validated through Zod to ensure that the configuration is correct.
 */
export const KeystaticStorage = z.union([local, cloud, github]).parse({
  kind: STORAGE_KIND,
  project: PROJECT,
  repo: REPO,
  branchPrefix: BRANCH_PREFIX,
  pathPrefix: PATH_PREFIX,
});
