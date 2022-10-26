const celebrate = require("celebrate");
const { celebrate, Joi, errors, Segments } = require("celebrate");

module.exports = ({ app, knex }) => {
  // create api route that gets messages for a channel
  app.get(
    "/channels/:channelId/messages",
    celebrate({
      [Segments.QUERY]: {
        limit: Joi.number().min(0).max(500).default(50),
        offset: Joi.number().min(0).default(0),
      },
    }),
    async (req, res) => {
      try {
        const channelId = req.params.channelId;
        // limit is how many items to return
        let limit = req.query.limit;
        // offset is how many items to skip
        const offset = req.query.offset;

        // get messages from database
        const messages = await knex("messages")
          .where({ channel: channelId })
          .limit(limit)
          .offset(offset);

        // send messages back to client
        res.send(messages);
      } catch (error) {
        console.error(error);
        res.status(500).send("Something broke!");
      }
    }
  );

  // create api route that creates a message for a channel
  app.post("/channels/:channelId/messages", async (req, res) => {
    try {
      const channelId = req.params.channelId;
      const { message } = req.payload;

      const createdMessage = await knex("messages")
        .insert({
          ...message,
          channel: channelId,
        })
        .returning("*")
        .then(([item]) => item);

      res.send(createdMessage);
    } catch (error) {
      console.error(error);
      res.status(500).send("Something broke!");
    }
  });

  // delete a message for a channel
  app.delete("/messages/:messageId", async (req, res) => {
    try {
      const messageId = req.params.messageId;

      await knex("messages")
        .where({
          id: messageId,
        })
        .del();

      res.send("ok");
    } catch (error) {
      console.error(error);
      res.status(500).send("Something broke!");
    }
  });

  // update a message for a channel
  app.patch("/messages/:messageId", async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const { message } = req.payload;

      message.updatedAt = new Date();

      const updatedMessage = await knex("messages")
        .where({
          id: messageId,
        })
        .update(message)
        .returning("*")
        .then(([item]) => item);

      res.send(updatedMessage);
    } catch (error) {
      console.error(error);
      res.status(500).send("Something broke!");
    }
  });

  // TODO: eventually... recent messages that are unread by the user
};
