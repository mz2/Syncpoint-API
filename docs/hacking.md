## Getting into the code

Like any good story, let's start at the beginning: [`bin/run`](../bin/run) is a little script that bootstraps everything else.

It loads [`syncpoint-api`](../lib/syncpoint-api.js) which binds the API event listeners to the various channels where mobile devices send session handshake and control documents.

Right now there are three pairing listeners: [Web](../plugins/pairWebUser.js), [Facebook](../plugins/pairViaFacebook.js) and [Console](../lib/pairViaAdminConsole.js). To activate Facebook you have to put your own Facebook `app_id` into the iOS example app.

## Control databases

When a user is paired, we create a database for them in the cloud, which is used as a control channel between the cloud and all of their devices. This control mechanism makes it so that all of a users devices are in sync.

The code that attaches to the control databases is in the [`userControlSetup.js`](../lib/userControlSetup.js) module. There's not much to it, the action is mostly in [`userChannelControl.js`](../lib/userChannelControl.js) where we actually react to control events and provision cloud databases.

## Running the tests

To run the tests, you've got to install the test dependencies. Change into the syncpoint directory (`cd node_modules/syncpoint` or wherever you checked this git repo out to) and run `npm install tap`;

Then run `npm test` (or `npm test syncpoint` if you moved back out to your root directory). Or if you also want to lint the code (good for contributors to do) run `grunt` from inside the project director.



