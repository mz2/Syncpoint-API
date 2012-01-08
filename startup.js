// launch script
// run with
// node startup.js
var controller = require('./controller'),
    welcome = '\n\
\n\
       ______                  __    __                  \n\
      / ____/____  __  _______/ /_  / /_  ____ _________ \n\
     / /    / __ \\/ / / / ___/ __ \\/ __ \\/ __ `/ ___/ _ \\\n\
    / /___ / /_/ / /_/ / /__/ / / / /_/ / /_/ (__  )  __/\n\
    \\____/ \\____/\\__,_/\\___/_/ /_/_.___/\\__,_/____/\\___/ \n\
\n\
\n\
       _____                              _        __ \n\
      / ___/__  ______  _________  ____  (_)____  / /_\n\
      \\__ \\/ / / / __ \\/ ___/ __ \\/ __ \\/ // __ \\/ __/\n\
     ___/ / /_/ / / / / /__/ /_/ / /_/ / // / / / /_  \n\
    /____/\\__, /_/ /_/\\___/ .___/\\____/_//_/ /_/\\__/  \n\
         /____/          /_/                          \n\
\n\
\n\
              MULTI USER CLOUD BACKUP AND SYNC MANAGER \n\
              relaxing since 2011 \n\
';
if (welcome.rainbow) {
    console.log(welcome.rainbow);
} else {
    console.log(welcome);
}

controller.start({control:'http://localhost:5984/control'})
