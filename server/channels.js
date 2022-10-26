module.exports = ({ app, knex }) => {
  // load all channels by a user
  app.get(
    "/channels/:userId",
    celebrate({
      [Segments.PARAMS]: {
        userId: Joi.string().uuid().required(),
      },
    }),
    async (req, res) => {
      try {
        const userId = req.params.userId;

        const channelsUser = await knex("channels_users").where({
          user: userId,
        });

        if (!channelsUser.length) {
          res.status(404).send("channels not found");
        }

        const channels = await knex("channels").whereIn(
          "id",
          channelsUser.map((channel) => channelsUser.channel)
        );

        return res.send(channels);
      } catch (error) {
        res.status(500).send("Something broke!");
      }
    }
  );

  // TODO @poeticninja: Think about using active/inactive status deleting/archiving channels
  // delete a channel
  app.delete("/channels/:channelId", async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(404).send("Missing id of item.");
      }

      // TODO: first delete all channel_users
      // TODO: then delete the channel
      // TODO: delete all channels_users

      // if this needs to be active/inactive then we need to add a column to the table
      await knex("channels").where({ id: userId }).del();

      res.send("Success");
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  // creates a new channel, add a user or users to the channel
  // get the current user, create a channel object in the databse, then create a channel_user object in the database
  app.post("/channels", async (req, res) => {
    const { users, channel } = req.body;

    try {
      const newChannel = await knex("channel")
        .insert(channel)
        .returning("*")
        .then(([item]) => item);

      const channelsUsersArray = users.map((userId) => ({
        user: userId,
        channel: newChannel.id,
      }));

      await knex("channels_users").insert(channelsUsersArray).returning("*");

      res.send(newChannel);
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  // adds a user to a channel
  // get the current user, then create a channel_user object in the database
  app.post("/channels/:channelId/users", async (req, res) => {
    const { channelId } = req.params;
    const { users } = req.body;

    // todo implement auth and this
    const userId = req.authenticatedUser.id;

    try {
      // lookup the channel to make sure it exists
      const channel = await knex("channels").where({ id: channelId }).first();

      // if channel doesnt exist return 404
      if (!channel) {
        res.status(404).send("Channel not found");
      }

      // get all channels_users for the channel
      const channelsUsers = await knex("channels_users").where({
        channel: channelId,
      });

      // check if the current user is in the channel
      const currentUserInChannel = channelsUsers.find(
        (channelUser) => channelUser.user === userId
      );

      if (!currentUserInChannel) {
        // return user not authorized
        return res.status(401).send("User not authorized");
      }

      // if channel does exist then add the user to the channel
      const channelsUsersArray = users.map((userId) => ({
        user: userId,
        channel: channelId,
      }));

      await knex("channels_users").insert(channelsUsersArray).returning("*");

      res.send("Success");
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  // remove a user from a channel
  app.delete("/channels/:channelId/:userId", async (req, res) => {
    const { userId, channelId } = req.params;

    try {
      if (!userId || !channelId) {
        res.status(404).send("Missing id of item.");
      }

      await knex("channels_users")
        .where({ user: userId, channel: channelId })
        .del();

      res.send("Success");
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });
};
