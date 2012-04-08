# Syncpoint API

Couchbase Syncpoint connects mobile devices to Apache CouchDB compatible storage, such as that offered by IrisCouch or Cloudant.

This Syncpoint API package is only a small part of the larger whole. This package implements user-driven remote configuration changes such as offline capable user signup, pairing new devices with the Syncpoint service, and provisioning databases in the cloud and across all of a users devices.

## Channels API

Channels are the unit of sync. A channel is defined by who can access it, and which devices it appears on. If you are subscribed to a channel, you are (generally) gonna see all the data in that channel. Since channels are just CouchDB databases, [there's a ton of existing documentation about the security model](http://stackoverflow.com/questions/4055450/couchdb-authorization-on-a-per-database-basis).

This can be used for all kinds of whatever: point-of-sale, retail, medical records (doctor with an iPad and limited wifi), military (need that data no matter what). [See these slides from Chicago's WindyCityGo conference for for inspiration of how you might structure an Syncpoint app.](http://dl.dropbox.com/u/14074521/syncpoint-windycity-small.pdf) (Note the OMG POP bragging has nothing to do with Syncpoint, they use Couchbase Server.)

## Today

The code in this repository is experimental, and we need your help. We in the process of cleaning up the build, install, and first run experience, as well as building example apps and documentation.

Please make your voice heard on the mailing list if you are interested in particular features, etc: https://groups.google.com/forum/#!forum/mobile-couchbase

### Get Started



### News

Removed dependency on Facebook Auth, instead you use whatever auth mechanism you want to on your server. We moved the example app away from Facebook and instead have auth based on the admin console CouchApp.

Once you have started the server with `bin/run`, visit http://localhost:5984/sp_config/_design/config/pages/index.html

### What does it do?

Let us know how it works for you:

* User can pair devices with Syncpoint cloud via the admin console (planning Facebook example code as well).
* Once paired, device code can create channels, and the server will provision the cloud database to sync with. These channels will show up on all of the user's devices by default.

That's it. It's up to you what you put in the channels on the server side, and who has acces to them on their devies.

There's not much more you need. See the **Longer term** section below for some ideas about where we go from here.

## Getting Started

We are in the early stages of implementation so we could use your help giving user feedback and all kinds of code patches from improving the test suite to building more authentication adapters to documenting the document state machine model used.

You'll know it's really usable when I publish it to [npm](http://npmjs.org).

Until then install [Apache CouchDB](http://couchdb.apache.org/) (preferably version 1.2) and then install Syncpoint:

    git clone git://github.com/couchbaselabs/Syncpoint-API.git
    cd Syncpoint-API
    bin/run

This will prompt you for configuration information about your CouchDB server. If you want to see flashy colors, run the tests with `grunt`

We have a unified [Syncpoint Client for iOS here](https://github.com/couchbaselabs/Syncpoint-iOS). (Be sure sure to clone it with `--recursive` to pick up the submodules.)

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
