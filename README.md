# Syncpoint API

Mobile Syncpoint is an API suite for synchronizing multi-user interactive applications using Apache CouchDB in the cloud and TouchDB on mobile devices.

## Why Sync?

Realtime is the future of the web. Users have multiple devices, and they want to share on their own terms.Syncpoint gives you the flexibility to build your application on top of CouchDB's trusted multi-user replication model.

Syncpoint can be used for things like these: point-of-sale, retail, medical records (doctor with an iPad and limited wifi), military (need that data no matter what), social games. [See this archtiecture introduction for inspiration of how you might structure an Syncpoint app.](http://dl.dropbox.com/u/14074521/syncpoint-dev.pdf)

## Millions of users, simplified.

With CouchDB, developers often use per-user database patterns to build sync apps. It works, and folks have success modeling groups, per-user backups, and more complex applications using this model. However, creating and managing all those databases takes code -- code that you don't want to have to write. We've seen what works with CouchSync apps, so we've built Syncpoint to create an easy on-ramp for mobile.

Syncpoint handles user signup, device pairing, and channel management, all with an extensible event-driven `_changes` based API. Syncpoint provisions users, devices, and channels. It's super-easy to hook into the server-side configuration change listeners and write your own event-driven plugins.

If you're building an app that's mostly a JSON API for phones or webpages, you're in the right place. [What do you want to see?](#community)

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

It may look like this only with zero users:

![admin console](/couchbaselabs/Syncpoint-API/raw/master/docs/admin-console.png)

Once you have <a href="https://github.com/couchbaselabs/Syncpoint-iOS">compiled the iOS app</a>, pointed at your new Syncpoint node, you see the "Sessions Awaiting Admin Approval" list on your phone or simulator, and you can active it via the admin console.

You don't have to go learn iOS right now. Syncpoint also works with HTML5 CouchApps, so if you want to do multi-user CouchApps, Syncpoint is the right place. There is a queue of all the users in your `_users` database, any you approve will be added to the app of your choice.

## Building Apps on Syncpoint

You can [read about the architecture of a Syncpoint App here.](https://github.com/couchbaselabs/Syncpoint-API/blob/master/docs/architecture.md) Also you will want to see [the Syncpoint API documentation.](https://github.com/couchbaselabs/Syncpoint-API/blob/master/docs/api.md)


## Contribute

You can get[deeper into the code here](https://github.com/couchbaselabs/Syncpoint-API/blob/master/docs/hacking.md). We welcome contribution. Currently very much in the clean things up for initial use stages.


### License

This is under the [Apache 2.0 license](LICENSE)
