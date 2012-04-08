testConfig = require "./testConfig"
host = testConfig.host
tap = require "tap"
coux = require "coux"
test = tap.test
plan = tap.plan
SyncpointAPI = require("../lib/syncpoint-api")
syncpoint = new SyncpointAPI(testConfig)

# delete test databases so we can ensure they are created according to config
setup = (cb) ->
  coux.del [ testConfig.host, testConfig.config_db ], ->
    coux.del [ testConfig.host, testConfig.handshake_db ], cb

test "database and design doc created by boostrap process", (t) ->
  t.plan 5
  setup ->
    syncpoint.start (err) ->
      coux [ host, testConfig.users_db ] , (err, ok) ->
        t.is ok.db_name, testConfig.users_db, "users db exists"

      coux [ host, testConfig.global_control_db ] , (err, ok) ->
        t.is ok.db_name, testConfig.global_control_db, "global_control_db db exists"

      coux [ host, testConfig.config_db ], (err, ok) ->
        t.is ok.db_name, testConfig.config_db, "config db exists"

      coux [ host, testConfig.config_db, "_design/config" ], (err, doc) ->
        t.ok doc.views, "config ddoc exists"

      coux [ host, testConfig.handshake_db ], (err, ok) ->
        t.is ok.db_name, testConfig.handshake_db, "handshake db exists"

test "quit", process.exit
