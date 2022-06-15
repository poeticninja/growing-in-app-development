const { camelCase, mapKeys, snakeCase } = require("lodash");

const camelCaseKeys = (obj) => mapKeys(obj, (_, key) => camelCase(key));

const postProcessResponse = (response) =>
  Array.isArray(response)
    ? response.map(camelCaseKeys)
    : camelCaseKeys(response);

const wrapIdentifier = (value, originalImplementation) =>
  originalImplementation(value === "*" ? value : snakeCase(value));

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "blah_blah",
      user: "smaddox",
      // password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    postProcessResponse,
    wrapIdentifier,
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "blah_blah",
      user: "smaddox",
      // password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    postProcessResponse,
    wrapIdentifier,
  },

  production: {
    client: "postgresql",
    connection: {
      database: "blah_blah",
      user: "smaddox",
      // password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    postProcessResponse,
    wrapIdentifier,
  },
};
