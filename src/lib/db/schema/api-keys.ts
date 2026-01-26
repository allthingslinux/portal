import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const apikey = pgTable(
  "apikey",
  {
    id: text("id").primaryKey(), // The ID of the API key (unique)
    name: text("name"), // Optional: The name of the API key
    start: text("start"), // Optional: Starting characters of the API key (for UI display)
    prefix: text("prefix"), // Optional: The API Key prefix (stored as plain text)
    key: text("key").notNull(), // The hashed API key itself
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // The ID of the user associated with the API key
    refillInterval: integer("refill_interval"), // Optional: The interval to refill the key in milliseconds
    refillAmount: integer("refill_amount"), // Optional: The amount to refill the remaining count
    lastRefillAt: timestamp("last_refill_at"), // Optional: The date and time when the key was last refilled
    enabled: boolean("enabled").default(true), // Whether the API key is enabled
    rateLimitEnabled: boolean("rate_limit_enabled").default(true), // Whether the API key has rate limiting enabled
    // Rate limit defaults reference RATE_LIMIT constants from @/lib/utils/constants
    // DEFAULT_TIME_WINDOW_MS: 86_400_000 (1 day)
    // DEFAULT_MAX_REQUESTS: 10
    rateLimitTimeWindow: integer("rate_limit_time_window").default(86_400_000), // Optional: The time window in milliseconds for the rate limit
    rateLimitMax: integer("rate_limit_max").default(10), // Optional: Maximum number of requests allowed within the time window
    requestCount: integer("request_count").default(0), // The number of requests made within the rate limit time window
    remaining: integer("remaining"), // Optional: The number of requests remaining
    lastRequest: timestamp("last_request"), // Optional: The date and time of the last request made to the key
    expiresAt: timestamp("expires_at"), // Optional: The date and time when the key will expire
    createdAt: timestamp("created_at").notNull(), // The date and time the API key was created
    updatedAt: timestamp("updated_at").notNull(), // The date and time the API key was updated
    permissions: text("permissions"), // Optional: The permissions of the key (JSON string)
    metadata: text("metadata"), // Optional: Any additional metadata stored with the key (JSON string)
  },
  (table) => [
    index("apikey_key_idx").on(table.key),
    index("apikey_userId_idx").on(table.userId),
  ]
);

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(), // Unique identifier for each web key
  publicKey: text("public_key").notNull(), // The public part of the web key
  privateKey: text("private_key").notNull(), // The private part of the web key (encrypted by default)
  createdAt: timestamp("created_at").notNull(), // Timestamp of when the web key was created
  expiresAt: timestamp("expires_at"), // Optional: Timestamp of when the web key expires
});
