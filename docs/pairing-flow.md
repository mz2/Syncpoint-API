Note: this is a bit out of date but is still the same basic design pattern.

# The Device Pairing Document Flow (via Email)

The goal of pairing is to verify that a given device is in the hand of a particular user. In the main case, the user navigates via Facebook, and obtains a token which is passed to the Syncpoint cluster via sync. As soon as the device is paired, Syncpoint automatically takes care of bringing the device up to date with the user's configuration and data as it exists on their other devices.

For simple apps, developers may assume the device owner is the app operator. However, the Syncpoint security model also supports multi-user capabilities, in which case the application level code should connect to Couchbase Mobile with credentials for the active session at any given time. Whether to write a single or multi-user application is at the discretion of the app developer.

This is a list of the document types and state transitions they go through in an attempt to communicate the design at a level above code. Sync is used as the API channel between each device and a control database assigned to it by the Syncpoint cluster. (By default this is based on the installation ssl key.)

## First document type: pairing

### In State: new

The server reacts to a pairing document in the `new` state by verifying the device and ultimiately initiating synchronization. Pairing documents are initially written in the `new` state by the app on the device, to initiate pairing with the syncpoint cluster. 

The document isn't written until the user has gone through the Facebook auth flow. We transmit the user data from Facebook in this document also. If not Facebook then prompt the user for email address and write this to the document.

And easily extensible for more future connection types. Typically the same user may connect to Syncpoint from multiple accounts on multiple devices. If possible we want to provide a seamless experience.

Schema draft for the pairing document:

    _id : uuid(),
    type : "pairing",
    state : "new",
    app_id: appId(),
    owner : {
        email:"email@example.com"
            or
        fb_code : code()
        verification_code : smallRand(), // used w/ email to ensure this is the verifying device and prevent timing or replay attacks.
    }
    signature : sig(doc)
        // crypto to prove the document goes with the SSL key.
    `ssl_public_key` : sha1(pubkey), // per-device or per-user?
    (maybe) oauth_creds : {
      consumer_key: smallRand(),
      consumer_secret: smallRand(),
      token_secret: smallRand(),
      token: smallRand()
    }

When the new install doc shows up in the cloud, it reacts by running the "confirm device" method, which either excepts the Facebook code, or the email address of the user. If it is the Facebook code we communicate with their API to verify. If it is email, we email the user to verify.

Note: device can't create user document as the user maybe already exists on the cluster. cluster creates a user doc and replicates it to the device.

### Digression: the email verification engine

The email verification engine, because it requires user intervention, has it's own document type to manage state: the verification attempt.

When the user clicks on the uniquely generated "confirm" link in an email, it prompts for the device code, and saves it as well as the unique confirmation URL code, to an `attempt` document in the `new` state.

The verification listener watches for new attempts and runs a query so that those that correctly match a pairing document's verification_ _code result in the installation becoming verified. Once verified, an installation synchronizes as much application data as practically necessary for the user.

Because the Facebook pairing process uses their web API, there is less need to write intermediate states to Couchbase documents, instead we simply connect with Facebook and verify the code (or not). Once that is done, we move on to the next step, confirming the pairing.

### Pairing: Confirmed

After the user has confirmed the install (via email or Facebook), the Syncpoint cluster updates the install document from "new" to "confirmed" state. 

Once the pairing document moves to the confirmed state, the security worker can promote it's credentials (oauth keyring or ssl public key) to have delegated access to all of the pairing user's data. There is room in this model for the user to grant device access to only a subset of their application data, for instance on a per-database level.

Now that the credentials are promoted, the bot updates the state of the device document to the `paired` state. This replicates to the installation notifying that it's credentials are now cleared to replicate user X's data and the database can begin to sync.

### Pairing: Paired

Now that the Syncpoint Cluster worker bot has updated the pairing document to `paired` state, this change syncs to the client device.

It syncs from the user's control database for that app (in syncpoint cluster), and based on that config data, establishes databases and sync relationships. Potentially even installs software on the user's mobile device, depending on the relationship to the platform.

The process of syncing a paired device is beyond the scope of this document, but it essentially involves creating client side databases corresponding to each database in the cluster.


## Channel Document

The document type `channel` is used to reflect a security domain. A channel is owned by a user, users, or a set of roles, and is accessible to a superset of non-owner "members".

The channel owner may invite other users to a channel, and the invited user is notified via push notification, Facebook, or email.

Channels are created and managed by owners via mobile installations. Creating a new channel is a normal end user operation. For example a point of sale application might involve a channel per store location for floor sales, and regional channels for managers, with a global executive view as it's own channel.

In an educational application, each class of would have a channel owned by the teacher, so that students interact with course materials and can be graded on their contributions. 

Couchbase Syncpoint is expected to be used also in platform-level deployments, where each channel may be shared across multiple applications. This would help in an educational context for eg grouping all of a classes's assignments together, even across eg physics and literature applications.

Channels are created as clones of the application template database, so that they already have the design documents in place for your application. Design document update across the cluster is a separate topic.

### New Channel

The `channel` document is initially created on the mobile device, at the request of the user. For instance an airline manager may create a channel for each flight, and then ground and air crew can coordinate service. Individual crew members could review things like the passenger manifest for upcoming flights, during downtime onboard. Or students could create channels for project teams to do things like notes or wiki. 

In a point of sale system, a broadcast channel might be maintained across all locations, carrying information like menu and pricing. Another set of channels would be location-specific, for cashiers to join, and finally management could maintain a private channel for rollups and historical data.

To create a channel, the mobile application writes a document like this to the `_control` database:

        {
            _id : uuid(),
            type : "channel",
            state: "new",
            query : {
                path : '_view/userPhotos',
                query : {
                    descending : true, // recent photos
                    endkey : ["jchris"],
                    startkey : ["jchris", {}],
                    limit : 10
                }
            },
            owner_user_ids: [currentUser()],
            owner_roles : [],
            member_user_ids : [],
            member_user_roles: ["friends-"+currentUser()],
            name : "Fun Times at Chris's House"
        }

The user can then get a view of their channels from the _control database, that allows them to see the name, and how many user's each channel has. 

## QueryDocument

Sync via Couchbase Server Query Document

### New Subscriptions

If it is my channel, I probably want to subscribe to it when I make it so that I can add documents to it right away (eg, sync it to my devices, so I will also create a subscription to it.) Any subscribed channels, that I am a member of, Syncpoint will keep available on my devices.

The subscription must be maintained as a distinct preference, as there is no guarantee the control database will include only channels the user wants to synchronize. For instance a service provider may broadcast channel metadata for phone themes or popular culture portals. The user can opt in to synchronize this content. In advanced installations it will be possible for the user to define preferences like "large magazines only on my tablet" or to remotely share only a single database by logging in from a friend's device.

The subscription document looks a little like this:

    type: subscription,
    state: active,
    subscriber_id : userId(),
    channel_id : channelId()
    
Subscriptions can be put in the 'paused' state which means we no longer update them automatically on all devices. Also they can be written in 'invite' mode when proposed by other users.

If a device sees a subscription in the active state and it does not already have a standing replication for that subscription, it creates a database and replication for that subscription. It also creates a document with type 'channel-db' that has an id the correponds to the channel sync database on the local machine. It can be used in views by the UI to present a list of available channels to the end user. Documents of type 'channel-db' are stored in a `_config` database locally (which is used by the same code driven by the `_control` database but which doesnt need to replicate with the cloud.)

an example channel-db document:

    type : 'channel-db',
    state : (active|offline|deleted)
    cloud_url : 'http://my.syncpoint.net/appid/channelid'
    _id : 'db-'+uuid(), // db prefix because databases 
            // are allergic to names starting with 0-9.
    channel_id : id() // id of channel document in _control database
    schedule : (continuous|interactive|background|lazy|off),
    network : (all|wifi|priority)

This document is where device / connection specific configuration can be managed. The device replicator is configured based on this document. // note maybe this can be in the _replicator db
    



The uuid corresponds to the database name on disk.







