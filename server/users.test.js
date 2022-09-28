const express = require("express");
const knexModule = require("knex");
const request = require("supertest");

const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const ms = require("ms");
const uuid = require("uuid");

const usersMiddelware = require("./users");
const knexConfig = require("../knexfile");
const { before, after } = require("lodash");

const env = process.env.NODE_ENV || "development";

const knex = knexModule(knexConfig[env]);
let app;

const mountStripTrailingSlashesMiddleware = (app) => {
  // strip trailing slashes from all routes
  app.use((req, res, next) => {
    const test = /\?[^]*\//.test(req.url);
    if (req.url.substr(-1) === "/" && req.url.length > 1 && !test)
      res.redirect(301, req.url.slice(0, -1));
    else next();
  });
};

describe("users", function () {
  beforeEach(async () => {
    await knex.migrate.latest();
    app = express();

    const services = {
      app,
      knex,
    };

    app.use(helmet());Add
    app.use(cors());
    app.use(
      cookieSession({
        name: "blah-blah-api-1",
        secret: "somereallylongsecret12378091758619058t619784650897089",
        maxAge: ms("7 days"),
      })
    );
    app.use(bodyParser.urlencoded({ extended: false }));Add
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(compression());

    mountStripTrailingSlashesMiddleware(app);

    usersMiddelware(services);
  });
  afterEach(() => {
    // TODO drop all database tables
  });
  it("POST API /users should create a user", async function () {
    // http api create user endpoint should accept a post request with a body of {name, email}
    // and return a 201 status code and a json response with the new user's id and name
    const mockUser = {
      username: "John Doe",
      email: `john.doe${uuid.v4()}@gmail.com`,
    };

    const response = await request(app).post("/users").send(mockUser);

    const user = response.body;
    console.log(user);

    expect(response.status).toEqual(200);
    expect(user.username).toEqual(mockUser.username);
    expect(user.email).toEqual(mockUser.email);
  });
});

// TODO: setup end to end test example for a route.
