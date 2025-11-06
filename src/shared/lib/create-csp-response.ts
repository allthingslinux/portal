import type { NoseconeOptions } from '@nosecone/next';

// we need to allow connecting to the Supabase API from the client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

// the URL used for Supabase Realtime
const WEBSOCKET_URL = SUPABASE_URL.replace('https://', 'ws://').replace(
  'http://',
  'ws://',
);

// disabled to allow loading images from Supabase Storage
const CROSS_ORIGIN_EMBEDDER_POLICY = false;

/**
 * @name ALLOWED_ORIGINS
 * @description List of allowed origins for the "connectSrc" directive in the Content Security Policy.
 */
const ALLOWED_ORIGINS = [
  SUPABASE_URL,
  WEBSOCKET_URL,
  // add here additional allowed origins
] as never[];

/**
 * @name IMG_SRC_ORIGINS
 */
const IMG_SRC_ORIGINS = [SUPABASE_URL] as never[];

/**
 * @name UPGRADE_INSECURE_REQUESTS
 * @description Upgrade insecure requests to HTTPS when in production
 */
const UPGRADE_INSECURE_REQUESTS = process.env.NODE_ENV === 'production';

/**
 * @name createCspResponse
 * @description Create a middleware with enhanced headers applied (if applied).
 */
export async function createCspResponse() {
  const {
    createMiddleware,
    withVercelToolbar,
    defaults: noseconeConfig,
  } = await import('@nosecone/next');

  /*
   * @name allowedOrigins
   * @description List of allowed origins for the "connectSrc" directive in the Content Security Policy.
   */

  const config: NoseconeOptions = {
    ...noseconeConfig,
    contentSecurityPolicy: {
      directives: {
        ...noseconeConfig.contentSecurityPolicy.directives,
        connectSrc: [
          ...noseconeConfig.contentSecurityPolicy.directives.connectSrc,
          ...ALLOWED_ORIGINS,
        ],
        imgSrc: [
          ...noseconeConfig.contentSecurityPolicy.directives.imgSrc,
          ...IMG_SRC_ORIGINS,
        ],
        upgradeInsecureRequests: UPGRADE_INSECURE_REQUESTS,
      },
    },
    crossOriginEmbedderPolicy: CROSS_ORIGIN_EMBEDDER_POLICY,
  };

  const middleware = createMiddleware(
    process.env.VERCEL_ENV === 'preview' ? withVercelToolbar(config) : config,
  );

  // create response
  const response = await middleware();

  if (response) {
    const contentSecurityPolicy = response.headers.get(
      'Content-Security-Policy',
    );

    const matches = contentSecurityPolicy?.match(/nonce-([\w-]+)/) || [];
    const nonce = matches[1];

    // set x-nonce header if nonce is found
    // so we can pass it to client-side scripts
    if (nonce) {
      response.headers.set('x-nonce', nonce);
    }
  }

  return response;
}
