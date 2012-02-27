# Syncpoint API

Couchbase Syncpoint will connect mobile devices to a Couchbase Server installation. Because devices have limited storage capacity, it's important to be able to select the relevant subset of data to sync with each user and device.

This Syncpoint API package is only a small part of the larger whole. This package is responsible for reacting to user-driven configuration changes such as pairing devices with the cloud, and provisioning new channels.

The ultimate goals of Syncpoint are ambitious: connecting millions of users and devices to high throughput Couchbase Server clusters. More responsive sync will mean happier users.

## Today

The code in this repository is experimental, but we can't build it all at once. And we've been making enough progress to warrant putting the code online. I can't tell you yet if these node.js scripts are prototypes or the real thing.

### What does it do?

Right now, today, on my machine (at least once) it does this:

* User can pair devices with Syncpoint cloud via Facebook.
* Once paired, device code can provision a Channel, and the server will provision the cloud database to sync with.

That's it.

There's not much more you need. See the **Longer term** section below for some ideas about where we go from here.

## Coming soon

Jens is working on a client library abstraction for iOS that will handle stuff like interacting with the server via the control channel to pair devices and provision databases.

If you want to get a preview of what those interactions look like, check out the ["pairing" branch of Grocery Sync](https://github.com/couchbaselabs/iOS-Couchbase-Demo/tree/pairing) or wait for Jens' code, it'll be *much cleaner.* :)

You can also study these sequence diagrams: 

* [Pairing via Facebook Connect.](docs/pairing-sequence.png)
* [The channel provisioning sequence](docs/channel-provisioning-sequence.png)

## Longer term

In the future we'll have some very exciting ways to get subsets of your data down to the device.

Once you have channels associate with users, you get some easy stuff "for free" -- any channel you provision shows up on all your users devices as a database. Any documents stored in the channel will show up in all instances of the channel.

What we think is really powerful, is what happens when you start to think about how to fill those channels from Couchbase Server. If you've got a Couchbase Server instance full of documents, you can start salivating now. Imagine writing a simple query and having the right documents show up in the channel. There's a lot of killer mobile apps you can build with that: medical records, real estate, social media, ecommerce catalogs, etc.

# To run this

Have [node.js](http://nodejs.org/) around, and run: `bin/run`

You may have to install some [npm](http://npmjs.org) modules before everything is happy. But probably not, as they are included in the repository under the `node_modules` directory.

## Configuring your installation

By default the Syncpoint API is driven as changes listeners connected to `http://localhost:5984`. You'll need to update the `config.json` directory with the URL of the host you are running against. 99% of the time it will be easier to use a publically addressable server, because it can be a pain to get your mobile device to connect to your local workstation. That said, there's no reason it wouldn't work with localhost, assuming you can get your phone on the same wifi as the server.

## Dependencies

These very early versions of Syncpoint use [Apache CouchDB](http://couchdb.apache.org) as the underlying storage, so you should be able to use this with [IrisCouch](http://www.iriscouch.com) (or maybe even [Cloudant](http://www.cloudant.com)), or your own Apache CouchDB installation.

There are some security features we depend on that are only in the upcoming 1.2 release of Apache CouchDB. Also Syncpoint won't be secure without at least a couple of small patches to Apache CouchDB (that Couchbase is working on).

In the longer term we'll be moving to a hybrid storage model with Apache CouchDB handling metadata and sync, but document data actually stored in Couchbase Server. Long before that happens we'll have gotten to the point where we no longer support Apache CouchDB as a backend (there's stuff we're gonna do that requires a fork). 

Expect at some time in the near future to be running the [Syncpoint API listener](https://github.com/couchbaselabs/syncpoint-api-listeners) code against a full-blown Couchbase Syncpoint. We'll make plenty of noise when this happens, and the upgrade path from Apache CouchDB to Couchbase Syncpoint should be seamless.


## Reading the code

To get into developing on this project, read [the intro to the code](docs/hacking.md)

### Of course

This is under the [Apache 2.0 license](LICENSE)
