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
    coux.del [ testConfig.host, testConfig.users_db ], cb

test "databases and design docs created by the boostrap process", (t) ->
  t.plan 6
  setup ->
    syncpoint.start (err) ->
      coux [ host, testConfig.users_db ] , (err, ok) ->
        t.is ok.db_name, testConfig.users_db, "users db exists"

      coux [ host, testConfig.global_control_db ] , (err, ok) ->
        t.is ok.db_name, testConfig.global_control_db, "global_control_db db exists"

      coux [ host, testConfig.config_db, "_design/config" ], (err, doc) ->
        t.notOk (err and err.reason is "no_db_file"), "config db exists"
        t.notOk err, "design doc created"
        t.ok doc.views, "config ddoc exists"

      coux [ host, testConfig.users_db ], (err, ok) ->
        t.is ok.db_name, testConfig.users_db, "handshake db exists"

test "quit", process.exit
