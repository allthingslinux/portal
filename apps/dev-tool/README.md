# Dev Tool

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The Dev Tools is an application that helps you manage your Portal environment variables and other settings.

## Getting Started

First, run the development server:

```bash
pnpm run --filter dev-tool dev
```

Open the link printed in the terminal to see the result.

## Testing production environment variables

To test your production environment variables, create a `.env.production.local` file in the `apps/web` directory and add your production environment variables.

This environment variables are not committed to the repository, so you can use them for testing purposes.

In the environment mode switcher, please select `Production` to test your production environment variables.

## Don't publish this app

This app is not intended to be published to the public. This is only meant to be used by for development purposes.
