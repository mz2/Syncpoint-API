## Getting into the code

Like any good story, let's start at the beginning: [`bin/run`](../bin/run) is a little script that bootstraps everything else.

It loads [`syncpoint-api`](../lib/syncpoint-api.js) which binds the API event listeners to the various channels where mobile devices send session handshake and control documents.

Right now there is only one pairing listener: [Facebook](../lib/seesionFromFacebook.js), but we will be adding a bunch more and documenting a plugin system so you can add your own (in any language).

## Control databases

When a user is paired, we create a database for them in the cloud, which is used as a control channel between the cloud and all of their devices. This control mechanism makes it so that all of a users devices are in sync.

The code that attaches to the control databases is in the [`userControlSetup.js`](../lib/userControlSetup.js) module. There's not much to it, the action is mostly in [`userChannelControl.js`](../lib/userChannelControl.js) where we actually react to control events and provision cloud databases.

## Running the tests

If you run `node test/testFacebookPairing.js` it will attempt to exercise the same code paths as a mobile device that is connecting to the cluster for the first time, via Facebook.

Coming soon will be tests around the channel management facilities.

## Example Mobile App

If you are building an iOS app, the Syncpoint Client is your best bet as far as getting a mobile device to connect. Syncpoint Client is not doing anything you couldn't do yourself by talking to [TouchDB](https://github.com/couchbaselabs/TouchDB-iOS) directly, but there's also no point in writing all that code when Syncpoint Client is open source and easy to use.



