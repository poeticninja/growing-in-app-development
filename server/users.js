module.exports = ({ app, knex }) => {
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
};
