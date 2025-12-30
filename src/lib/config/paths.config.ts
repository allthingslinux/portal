import { z } from "zod";

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string().min(1),
    callback: z.string().min(1),
  }),
  app: z.object({
    home: z.string().min(1),
    personalAccountSettings: z.string().min(1),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: "/auth/sign-in",
    callback: "/auth/callback",
  },
  app: {
    home: "/dashboard",
    personalAccountSettings: "/settings",
  },
} satisfies z.infer<typeof PathsSchema>);

export default pathsConfig;
