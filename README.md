## Growing in App Development

Chat App = Blah Blah

## Features:

### V1

- Messages
- Channels
- Profile (name info)
- Timestamps

- Read Receipts
- Delivery Confirmation
- Status
- Typing visibility
- Reactions (hearting, thumbs up and down - emojis)

### V2

- Multimedia / File uploads

### V3

- Direct Messages
- Notifications
- Teams
- Group Messages

### V4

- Search
- Plugins/Extensions

#### DATABASE TABLES

- users
  - id
  - created_at
  - updated_at
  - email
  - username
- messages
  - id
  - created_at
  - updated_at
  - created_by = users.id
  - channel = channels.id
- channels (1 to 1, or 1 to many)
  - id
  - created_at
  - updated_at
  - name
  - type (channel,dm,group)
  - created_by
- channels_users
  - id
  - user
  - channels


### TODO:

- create api for messages
- add schema and api to handle notification and highlighting of new messages
- improve database error handling 
- add model utils for common db operations
- add logging
- add auth
- add api input validation with celebrate https://github.com/arb/celebrate