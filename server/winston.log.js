"use strict";

// example 1
// const winston = require('winston');

// const logger = (module.exports = winston.createLogger({
//   transports: [new winston.transports.Console()],
//   format: winston.format.combine(
//     winston.format.colorize({ all: true }),
//     winston.format.simple()
//   )
// }));

// logger.log("info", "This is an information message.");

//example 2
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}
