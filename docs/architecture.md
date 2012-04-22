Syncpoint manages CouchDB databases. It uses the Oauth feature of Apache CouchDB 1.2 to distribute keys to devices, and then replicates instructions via CouchSync to share database sync preferences across all of a users devices.



## Security

The CouchSync document model encourages the notion that each database is an independent security domain. A member of a database can read all the documents, and update them according to application validation logic. It's up to the developer (that's you) to decide who gets access to which channels.

By default Syncpoint keeps each users's full set of devices identical. That means if they install your app on their phone and their tablet, it will have the same data in both places.

It is possible with some server side configuration, to create shared Channels, with multiple users. Users in shared channels see each others updates in real time. They can also continue to query and update data when they are disconnected, so apps stay smooth even on unreliable networks.

For sync applications, your validation logic is run in the Syncpoint cloud, on the users documents as they sync up from the mobile device. By rejecting and invalid updates (can't change doc.author, or whatever your app needs) you can prevent invalid data from being accepted by your servers.

## Channels API

Channels are the unit of sync. A channel is defined by who can access it, and which devices it appears on. If you are subscribed to a channel, you are (generally) able to see all the data in that channel. Since channels are just CouchDB databases, [there's existing documentation about the security model](http://guide.couchdb.org/draft/security.html).

Channels make it easy to keep all of a users devices in sync, and to create apps that bridge multiple users without stressing.
