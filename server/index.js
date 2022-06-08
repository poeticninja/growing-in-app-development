const express = require("express");
const knexModule = require("knex");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const knexConfig = require("../knexfile");

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

  // read user api route
  app.get("/users/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(404).send("Missing id of item to update.");
      }

      const users = await knex("users").where({
        id: userId,
      });

      if (!users.length) {
        res.status(404).send("User not found");
      }

      return res.send(users[0]);
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  // create user api route
  app.post("/users", (req, res) => {
    knex("users")
      .insert(req.body)
      .returning("*")
      .then(([item]) => item)
      .then((user) => {
        res.send(user);
      })
      .catch(() => {
        res.status(500).send("Something broke!");
      });
  });

  // update user api route
  app.patch("/users/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(404).send("Missing id of item to update.");
      }
      const value = req.body;

      value.updatedAt = new Date();

      const updatedUser = await knex("users")
        .where({ id: userId })
        .update(value)
        .returning("*")
        .then(([item]) => item);

      return res.send(updatedUser);
    } catch (error) {
      console.log("error fun looking");
      console.log(error);
      res.status(500).send("Something broke!");
    }
  });

  // delete user api route
  app.delete("/users/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(404).send("Missing id of item to update.");
      }

      await knex("users").where({ id: userId }).del();

      res.send("Success");
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  await pingDatabaseConnection();
  await knex.migrate.latest();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

init();
