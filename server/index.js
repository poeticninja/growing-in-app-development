const express = require("express");
const knexModule = require("knex");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const knexConfig = require("../knexfile");
const users = require("./users");
const channels = require("./channels");
const messages = require("./messages");

const env = process.env.NODE_ENV || "development";

const knex = knexModule(knexConfig[env]);

const pingDatabaseConnection = async () => {
  // ping postgres database to make sure it is available before starting server
  try {
    await knex.queryBuilder().select(knex.raw("1"));
  } catch (error) {
    const message = "Unable to connect to postgrss database on startup";
    error.message = message + (error.message ? `: ${error.message}` : "");
    throw error;
  }
};

const init = async () => {
  const app = express();
  const port = 3000;

  const services = {
    app,
    knex,
  };

  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(compression());

  // strip trailing slashes from all routes
  app.use((req, res, next) => {
    const test = /\?[^]*\//.test(req.url);
    if (req.url.substr(-1) === "/" && req.url.length > 1 && !test)
      res.redirect(301, req.url.slice(0, -1));
    else next();
  });

  users(services);
  channels(services);
  messages(services);

  await pingDatabaseConnection();
  await knex.migrate.latest();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

init();
