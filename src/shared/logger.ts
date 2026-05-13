import pino from "pino";
import { AsyncLocalStorage } from "node:async_hooks";

export const loggerAls = new AsyncLocalStorage<pino.Logger>();

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  redact: {
    paths: [
      "email",
      "password",
      "address",
      "user.email",
      "user.password",
      "user.address",
      "*.email",
      "*.password",
      "*.address",
    ],
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
});

export const getLogger = () => {
  return loggerAls.getStore() || logger;
};
