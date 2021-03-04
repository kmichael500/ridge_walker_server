import * as express from "express";
import * as mongoose from "mongoose";
import { Logger, LogLevel } from "./Services/LogService";
import { startup } from "./Startup";
import { ServerOptions } from "./Models/Options/ServerOptions";
import { caveRoute } from "./Routes/Caves/CaveRoute";
import * as bodyParser from "body-parser";
import { authenticationRoute } from "./Routes/Authentication/AuthenticationRoute";
import { StatusCodes } from "http-status-codes";
import { AuthenticationError } from "./Routes/Authentication/Models/AuthenticationError";
import { ValidationError } from "class-validator";

// Gets .env arguments from file
startup();

const serverOptions = new ServerOptions();

const app = express();

mongoose
  .connect(serverOptions.mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // ensure index is deprecated
  })
  .then(() => Logger.log("MongoDB successfully connected"))
  .catch((error: Error) => Logger.log(error.message, LogLevel.Fatal));

// #region Routes

app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

app.use("/api/points/master", caveRoute); // bodyParser parses the body of all routes as json

app.use("/api/authenticate", authenticationRoute); // bodyParser parses the body of all routes as json

// #region Global Error Handling

// Send 404 if route not found.
app.use((req, res) => {
  res.statusCode = StatusCodes.NOT_FOUND;
  res.send();
});

const errorHandler: express.ErrorRequestHandler = (
  error,
  request,
  response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next
) => {
  // bad username/password
  if (error instanceof AuthenticationError) {
    response.statusCode = StatusCodes.UNAUTHORIZED;
    response.send(error.message);

    // bad arguments
  } else if (Array.isArray(error) && error[0] instanceof ValidationError) {
    response.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;

    // TODO: Send back more than one error
    // TODO: Fix this insane mess.
    const errorMessage = (error.filter(
      (e) => e instanceof ValidationError
    ) as ValidationError[]).map((e) => {
      if (e.constraints) {
        return e.constraints[Object.keys(e.constraints)[0]];
      } else if (e.children && e.children[0].constraints) {
        return e.children[0].constraints[
          Object.keys(e.children[0].constraints)[0]
        ];
      } else {
        return "Validation Error";
      }
    });
    response.send(errorMessage[0]);

    // default
  } else if (error instanceof Error) {
    response.statusCode = StatusCodes.BAD_REQUEST;
    response.send(error.message);
  } else {
    response.statusCode = StatusCodes.BAD_REQUEST;
    response.send(error);
  }
};
app.use(errorHandler);

// #endregion

// #endregion

app.listen(serverOptions.port, () =>
  Logger.log(
    `Server up and running on port ${serverOptions.port}!`,
    LogLevel.Information
  )
);
