var fs = require('fs'),  
  path = require("path"),
  configPath = path.join(__dirname, "..","config.json"),
  ok = false,
  config = fs.readFileSync(configPath, "utf8");

try {
  config = JSON.parse(config);
  ok = true;
} catch (e) {
  console.error("could not read config.json, please use `npm start syncpoint` to set up your installation: "+configPath);
}

// we use the configured host but test databases.
// if there is a test_host configured we use that instead
module.exports = {
    "host" : config.test_host || config.host,
    "admin_db" : "test_sp_admin",
    "users_db" : "test_sp_users"
}
