/**
 * Queue instrumentation utilities for messaging and background jobs
 */

// Shared type for trace headers
type TraceHeaders = {
  "sentry-trace"?: string;
  baggage?: string;
};

interface QueueMessage {
  id: string;
  body: unknown;
  timestamp: number;
  retryCount?: number;
}

interface QueueProducerOptions {
  messageId: string;
  queueName: string;
  messageSize: number;
}

interface QueueConsumerOptions {
  messageId: string;
  queueName: string;
  messageSize: number;
  retryCount?: number;
  receiveLatency?: number;
}

/**
 * Build consumer attributes object from options
 */
const buildQueueConsumerAttributes = (options: QueueConsumerOptions) => ({
  "messaging.message.id": options.messageId,
  "messaging.destination.name": options.queueName,
  "messaging.message.body.size": options.messageSize,
  ...(options.retryCount !== undefined && {
    "messaging.message.retry.count": options.retryCount,
  }),
  ...(options.receiveLatency !== undefined && {
    "messaging.message.receive.latency": options.receiveLatency,
  }),
});

/**
 * Instrument queue message publishing
 */
export const instrumentQueueProducer = async <T>(
  options: QueueProducerOptions,
  producer: (traceHeaders: TraceHeaders) => Promise<T>
): Promise<T> => {
  try {
    const { startSpan, getTraceData } = require("@sentry/nextjs");

    return await startSpan(
      {
        name: "queue_producer",
        op: "queue.publish",
        attributes: {
          "messaging.message.id": options.messageId,
          "messaging.destination.name": options.queueName,
          "messaging.message.body.size": options.messageSize,
        },
      },
      async () => {
        const traceHeaders = getTraceData();
        return await producer(traceHeaders);
      }
    );
  } catch {
    // Fallback without instrumentation
    return await producer({});
  }
};

/**
 * Instrument queue message consumption
 */
export const instrumentQueueConsumer = async <T>(
  options: QueueConsumerOptions,
  traceHeaders: TraceHeaders,
  consumer: () => Promise<T>
): Promise<T> => {
  try {
    const { continueTrace, startSpan } = require("@sentry/nextjs");

    return await continueTrace(
      {
        sentryTrace: traceHeaders["sentry-trace"],
        baggage: traceHeaders.baggage,
      },
      async () => {
        return await startSpan(
          {
            name: "queue_consumer_transaction",
          },
          async (parent: {
            setAttribute: (key: string, value: unknown) => void;
            setStatus?: (status: { code: number; message: string }) => void;
          }) => {
            try {
              const result = await startSpan(
                {
                  name: "queue_consumer",
                  op: "queue.process",
                  attributes: buildQueueConsumerAttributes(options),
                },
                consumer
              );

              // Use Sentry status constants
              try {
                const { SPAN_STATUS_OK, SPAN_STATUS_ERROR } = require("@sentry/core");
                parent.setStatus?.({ code: SPAN_STATUS_OK, message: "ok" });
              } catch {
                // Fallback if constants not available
                parent.setStatus?.({ code: 1, message: "ok" });
              }
              return result;
            } catch (error) {
              // Use Sentry status constants
              try {
                const { SPAN_STATUS_ERROR } = require("@sentry/core");
                parent.setStatus?.({ code: SPAN_STATUS_ERROR, message: "error" });
              } catch {
                // Fallback if constants not available
                parent.setStatus?.({ code: 2, message: "error" });
              }
              throw error;
            }
          }
        );
      }
    );
  } catch {
    // Fallback without instrumentation
    return await consumer();
  }
};

/**
 * Helper to create queue message with trace headers
 */
export const createQueueMessage = (
  id: string,
  body: unknown,
  traceHeaders: TraceHeaders
): QueueMessage & { sentryTrace?: string; sentryBaggage?: string } => {
  return {
    id,
    body,
    timestamp: Date.now(),
    sentryTrace: traceHeaders["sentry-trace"],
    sentryBaggage: traceHeaders.baggage,
  };
};

/**
 * Helper to calculate receive latency
 */
export const calculateReceiveLatency = (message: QueueMessage): number => {
  return Date.now() - message.timestamp;
};
