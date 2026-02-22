import { createEnv } from "@t3-oss/env-nextjs";

import { keys as auth } from "@/auth/keys";
import { keys as database } from "@/db/keys";
import { keys as discord } from "@/features/integrations/lib/discord/keys";
import { keys as irc } from "@/features/integrations/lib/irc/keys";
import { keys as xmpp } from "@/features/integrations/lib/xmpp/keys";
import { keys as observability } from "@/shared/observability/keys";

export const env = createEnv({
  extends: [auth(), database(), observability(), xmpp(), irc(), discord()],
  server: {},
  client: {},
  runtimeEnv: {},
});
