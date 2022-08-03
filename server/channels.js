module.exports = ({ app, knex }) => {
  // load all channels by a user
  app.get("/channels/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(404).send("Missing id.");
      }

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
  });

  // @TODO: Think about using active/inactive status deleting/archiving channels
  // delete a channel
  app.delete("/channels/:channelId", async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(404).send("Missing id of item.");
      }

      // if this needs to be active/inactive then we need to add a column to the table
      await knex("channels").where({ id: userId }).del();

      res.send("Success");
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  // add a user to a channel
  // create a new channel, add a user to it
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

      await knex("channels_users").insert(channelUserArray).returning("*");

      res.send(newChannel);
    } catch (error) {
      res.status(500).send("Something broke!");
    }
  });

  // remove a user from a channel
  // @TODO NEXT TIME!

  // create a channel and pass in an array of users to be part of that channel.
};
