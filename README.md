# Syncpoint API

Sync realtime multi-user applications with Apache CouchDB in the cloud and TouchDB on mobile devices.

Mobile Syncpoint is an API suite for synchronizing multi-user interactive applications using Apache CouchDB in the cloud and TouchDB on mobile devices.

## Why Sync?

Realtime is the future of the web. Users have multiple devices, and they want to share on their own terms.Syncpoint gives you the flexibility to build your application on top of CouchDB's trusted multi-user replication model.

Syncpoint can be used for things like these: point-of-sale, retail, medical records (doctor with an iPad and limited wifi), military (need that data no matter what), social games. [See this archtiecture introduction for inspiration of how you might structure an Syncpoint app.](http://dl.dropbox.com/u/14074521/syncpoint-dev.pdf)

## Millions of users, simplified.

Syncpoint manages Apache CouchDB databases for multi-device installations. It provides a distributed API so that clients can ask the server to provision channels, and have a database created in the cloud. It also handles new user signup and mobile device pairing, and even works with CouchDB web user signup, if you want to provision databases for your web users.

Syncpoint API drivers work by listening for document updates in CouchDB. Developers can register listeners for document types, so any additional functionality is just a JavaScript module that binds to the control channel. All of Syncpoint API is implemented in that way, so code examples are easy to find. (Look in the `lib` and `plugins` directories).

If you're building an app that's mostly a JSON API for phones or webpages, you're in the right place. [What do you want to see?](https://groups.google.com/forum/#!forum/mobile-couchbase)

We need your feedback and contributions, they will play a huge role in the direction of the project, so please let us know if you are experimenting with Syncpoint.

## Get Started

You need to have three prerequisites. iOS dev chops, Node.js (>=0.6.0) and Apache CouchDB (>=1.2.0). You can get hosted CouchDB free at [IrisCouch](http://www.iriscouch.com) or [Cloudant](http://www.cloudant.com). Once you have your cloud CouchDB url, and you have installed node.js, you can use the Node Package Manager to install Syncpoint:

    mkdir syncpoint && cd syncpoint
    npm install syncpoint
    npm start syncpoint

Syncpoint will be installed in your current working directory, under `node_modules`. Alternatively if you want to contribute, you can install via git:

    git clone git://github.com/couchbaselabs/Syncpoint-API.git
    cd Syncpoint-API
    npm install
    npm start

It will prompt you for your cloud URL, and help you set up an admin password.  Continue this adventure by opening the Admin console (your terminal should have printed out the link to the admin console when you ran `npm start syncpoint`);

It may look like this only without any users yet:

![admin console](/couchbaselabs/Syncpoint-API/raw/master/docs/admin-console.png)

Once you have <a href="https://github.com/couchbaselabs/Syncpoint-iOS">compiled the iOS app</a>, pointed at your new Syncpoint node, you see the "Sessions Awaiting Admin Approval" list on your phone or simulator, and you can active it via the admin console.

You don't have to go learn iOS right now. Syncpoint also works with HTML5 CouchApps, so if you want to do multi-user CouchApps, Syncpoint is the right place. There is a queue of all the users in your `_users` database, any you approve will be added to the app of your choice.

## Building Apps on Syncpoint

You can [read about the architecture of a Syncpoint App here.](https://github.com/couchbaselabs/Syncpoint-API/blob/master/docs/architecture.md) Also you will want to see [the Syncpoint API documentation.](https://github.com/couchbaselabs/Syncpoint-API/blob/master/docs/api.md)


## Contribute

You can get[deeper into the code here](https://github.com/couchbaselabs/Syncpoint-API/blob/master/docs/hacking.md). We welcome contribution.

Some rough todos: 
  
Last big one as far as working out the API, is one user creates a private channel, and then invites other users to it. Also, how to best advertise public channels?

Also lots of clean up in the iOS Syncpoint framework.

And in this code base, I think things could be modulized better, move to using follow instead of coux for changes. 

Maybe the subcomponents (Facebook pairing, etc) can be made independent NPM modules. Then there would need to be some config step or module install step on the part of the user to activate those but we want that anyway I think.

### License

This is under the [Apache 2.0 license](LICENSE)
