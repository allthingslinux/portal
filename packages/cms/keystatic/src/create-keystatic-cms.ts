import { CmsClient } from '@portal/cms-types';

/**
 * Creates a new Keystatic client instance.
 */
export async function createKeystaticClient() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' ||
    process.env.KEYSTATIC_STORAGE_KIND !== 'local'
  ) {
    const { createKeystaticClient: createClient } = await import(
      './keystatic-client'
    );

    return createClient();
  }

  console.error(
    `[CMS] Keystatic client using "Local" mode is only available in Node.js runtime. Please choose a different CMS client. Returning a mock client instead of throwing an error.`,
  );

  return mockCMSClient() as unknown as CmsClient;
}

function mockCMSClient() {
  return {
    getContentItems() {
      return Promise.resolve({
        items: [],
        total: 0,
      });
    },
    getContentItemBySlug() {
      return Promise.resolve(undefined);
    },
  };
}
