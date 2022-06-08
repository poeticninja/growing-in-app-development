const hapi = require("@hapi/hapi");
const boom = require("@hapi/boom");
const joi = require("joi");
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
  const server = hapi.server({
    port: 3000,
    host: "localhost",
    state: {
      strictHeader: false,
    },
    router: {
      stripTrailingSlash: true,
    },
  });

  server.route({
    method: "GET",
    path: "/users/{userId}",
    options: {
      validate: {
        params: joi.object({
          userId: joi.string().required(),
        }),
      },
    },
    handler: (request, h) => {
      const users = await knex("users").where({
        id: request.params.userId,
      });

      if (!users.length) {
        return boom.notFound("User not found");
      }

      return res.send(users[0]);
    },
  });

  server.route({
    method: "POST",
    path: "/users",
    handler: (request, h) => {
      const user = await knex("users").insert(request.payload);

      return user;
    },
  });

  server.route({
    method: "PATCH",
    path: "/users/{userId}",
    options: {
      validate: {
        params: joi.object({
          userId: joi.string().required(),
        }),
      },
    },
    handler: (request, h) => {
      const value = request.payload;
      const userId = request.params.userId;

      value.updatedAt = new Date();

      const updatedUser = await knex("users")
        .where({ id: userId })
        .update(value)
        .returning("*")
        .then(([item]) => item);

      return updatedUser;
    },
  });

  server.route({
    method: "DELETE",
    path: "/users/{userId}",
    options: {
      validate: {
        params: joi.object({
          userId: joi.string().required(),
        }),
      },
    },
    handler: (request, h) => {
      await knex("users").where({ id: userId }).del();

      return "Success";
    },
  });

  await pingDatabaseConnection();
  await knex.migrate.latest();
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

init();
