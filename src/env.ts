import { createEnv } from "@t3-oss/env-nextjs";

import { keys as auth } from "@/lib/auth/keys";
import { keys as database } from "@/lib/db/keys";
import { keys as xmpp } from "@/lib/integrations/xmpp/keys";
import { keys as observability } from "@/lib/observability/keys";

export const env = createEnv({
  extends: [auth(), database(), observability(), xmpp()],
  server: {},
  client: {},
  runtimeEnv: {},
});
