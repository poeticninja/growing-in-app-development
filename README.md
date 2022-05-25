## Growing in App Development

Chat App = Blah Blah

Features:
_V1_
Messages
Channels
Read Receipts
Delivery Confirmation
Timestamps
Profile (name info)
Status
Typing visibility
Reactions (hearting, thumbs up and down - emojis)

_V2_
Multimedia / File uploads

_V3_
Direct Messages
Notifications
Teams
Group Messages

_V4_
Search
Plugins/Extensions

schema [id][name][location][age]

users
{
id: '3',
name: 'Saul'
}
{
foo: 'something else',
geo: 'Saul'
}

redis:
'grabUser:123' = 'another string'

DATABASE TABLES
users
messages
conversations (1 to 1, or 1 to many): type (channel,dm,group)
