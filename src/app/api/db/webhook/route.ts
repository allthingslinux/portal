import { getDatabaseWebhookHandlerService } from '~/core/database-webhooks';
import { getServerMonitoringService } from '~/core/monitoring/api/services/get-server-monitoring-service';
import { enhanceRouteHandler } from '~/shared/next/routes';

/**
 * @name POST
 * @description POST handler for the webhook route that handles the webhook event
 */
export const POST = enhanceRouteHandler(
  async ({ request }) => {
    const service = getDatabaseWebhookHandlerService();

    try {
      const signature = request.headers.get('X-Supabase-Event-Signature');

      if (!signature) {
        return new Response('Missing signature', { status: 400 });
      }

      const body = await request.clone().json();

      // handle the webhook event
      await service.handleWebhook({
        body,
        signature,
      });

      // return a successful response
      return new Response(null, { status: 200 });
    } catch (error) {
      const service = await getServerMonitoringService();

      await service.ready();
      await service.captureException(error as Error);

      // return an error response
      return new Response(null, { status: 500 });
    }
  },
  {
    auth: false,
  },
);
