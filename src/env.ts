import { createEnv } from "@t3-oss/env-nextjs";

import { keys as auth } from "@/features/auth/lib/auth/keys";
import { keys as xmpp } from "@/features/integrations/lib/integrations/xmpp/keys";
import { keys as database } from "@/shared/db/keys";
import { keys as observability } from "@/shared/observability/keys";

export const env = createEnv({
  extends: [auth(), database(), observability(), xmpp()],
  server: {},
  client: {},
  runtimeEnv: {},
});
