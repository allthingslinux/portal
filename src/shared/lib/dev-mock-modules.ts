/*
* Mock modules for development.

This file is used to mock the modules that are not needed during development (unless they are used).
It allows the development server to load faster by not loading the modules that are not needed.
 */

const noop = (name: string) => () => {
  console.debug(
    `The function "${name}" is mocked for development because your environment variables indicate that it is not needed. 
    If you think this is a mistake, please open a support ticket.`
  );
};

// Turnstile
export const Turnstile = undefined;
export const TurnstileProps = {};

// Baselime
export const useBaselimeRum = noop("useBaselimeRum");
export const BaselimeRum = undefined;

// Sentry
export const captureException = noop("Sentry.captureException");
export const captureEvent = noop("Sentry.captureEvent");
export const init = noop("Sentry.init");
export const setUser = noop("Sentry.setUser");

// Nodemailer
export const createTransport = noop("Nodemailer.createTransport");
