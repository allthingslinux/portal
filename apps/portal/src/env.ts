import { keys as database } from "@portal/db/keys";
import { keys as observability } from "@portal/observability/keys";
import { createEnv } from "@t3-oss/env-nextjs";

import { keys as auth } from "@/auth/keys";
import { keys as discord } from "@/features/integrations/lib/discord/keys";
import { keys as irc } from "@/features/integrations/lib/irc/keys";
import { keys as mailcow } from "@/features/integrations/lib/mailcow/keys";
import { keys as mediawiki } from "@/features/integrations/lib/mediawiki/keys";
import { keys as xmpp } from "@/features/integrations/lib/xmpp/keys";
import { keys as devTools } from "@/shared/dev-tools/keys";

export const env = createEnv({
  extends: [
    auth(),
    database(),
    devTools(),
    observability(),
    xmpp(),
    irc(),
    mailcow(),
    discord(),
    mediawiki(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
