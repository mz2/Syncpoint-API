This API is moving fast. If you want to see something added here, please make a pull request to this file.

All of this stuff is just interacting with the device's control database, so anything you see an API client doing, can be accomplished without a Syncpoint client, if all you have is TouchDB or CouchDB and you want to interact with a Syncpoint cluster, you can do all this via the JSON document API.

## List channels

**Status: needs Objective-C implementation**

There are a few ways to list channels (todo need Objective-C view code for these). For now you can browse them in the admin console.

  * channels I am the owner of
  * channels I am a member of
  * public channels

So these 3 sets should be readable on the phone, and then multi-channel apps can take advantage of the different lists to allow the user to change contexts within the app.

## Manipulate Channels

### Find or create a database for named "foo" where I am the owner. 

**Status: actually exists**

This is useful for working with data before you have established a sync session. Channel creation is deferred until the session is established, to avoid spurious duplicate channels. #TODO a patch to allow full Channel creation before sessions are established, and merging existing channels on first sync, would be neat. Either way, the API is like this:

```Objective-C
  CouchDatabase* database = [syncpoint databaseForMyChannelNamed: @"foo" error: &error];
```

This returns a [CouchCocoa database](http://couchbaselabs.github.com/CouchCocoa/docs/interfaceCouchDatabase.html) that you can do clever stuff with like subscribe to document change events. [See it in context of the demo application code.](https://github.com/couchbaselabs/Syncpoint-iOS/blob/master/Syncpoint/Demo-iOS/DemoAppDelegate.m#L55)

### Invite my friend to a channel

**Status: pending/imaginary.** But it is easy enough to do manually, and it would look something like this.

```Objective-C
  SyncpointChannel* channel = [syncpoint.session myChannelWithName: @"foo" error: &error];
  SyncpointUser* friend = [syncpoint.friendWithAddress("jchris@couchbase.com")];
  [channel addMember: friend];
```

Now on the friend's side they can see the channel in the "channels I am a member of" view, and opt in to subscribe and install it.

Implementors note. This would be done by the owner updating the channel document with a member_names or member_roles array. It is then the responsibility of Syncpoint to apply those changes to the channel cloud_database as well as broadcast an updated version of the document to all channel members.




