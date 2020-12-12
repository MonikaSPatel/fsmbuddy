import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import lodash from "lodash";
import moment from "moment";
//import swagger from "swagger-node-express";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger.json";

global._ = lodash;
global.moment = moment;

// custom service for api response
import appService from "./services/app.js";

// db connection
import "./config/connect-db";

let port = process.env.PORT || 7777;
let app = express();

var swagger = require("swagger-spec-express");
var packageJson = require("./package.json");

var options = {
  title: packageJson.name,
  version: packageJson.version,
};
swagger.initialise(app, options);

// app
//   .get("/swagger", function(err, res) {
//     res.status(200).json(swagger.json());
//   })
//   .describe({
//     responses: {
//       200: {
//         description: "Returns the swagger.json document"
//       }
//     }
//   });

//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// swagger.setAppHandler(app);
// swagger.addValidator(function validate(req, path, httpMethod) {
//   //  example, only allow POST for api_key="special-key"
//   if ("POST" == httpMethod || "DELETE" == httpMethod || "PUT" == httpMethod) {
//     var apiKey = req.headers["api_key"];
//     if (!apiKey) {
//       apiKey = url.parse(req.url, true).query["api_key"];
//     }
//     if ("special-key" == apiKey) {
//       return true;
//     }
//     return false;
//   }
//   return true;
// });

app.use(cors(), bodyParser.urlencoded({ extended: true }), bodyParser.json());
app.use(appService);

app.listen(port, console.info("Server running, listening on port ", port));

app.use("/uploads", express.static("uploads"));

import web from "./routes/web.js";
app.use("/", web);

import errorService from "./services/error.js";
app.use(errorService);

swagger.compile();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger.json()));

if (process.env.NODE_ENV == `production`) {
  app.use(express.static(path.resolve(__dirname, "../client/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve("index.html"));
  });
}
