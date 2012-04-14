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
  coux.del [ testConfig.host, testConfig.admin_db ], ->
    coux.del [ testConfig.host, testConfig.users_db ], cb

test "databases and design docs created by the boostrap process", (t) ->
  t.plan 6
  setup ->
    syncpoint.start (err) ->
      coux [ host, testConfig.users_db ] , (err, ok) ->
        t.is ok.db_name, testConfig.users_db, "users db exists"

      coux [ host, testConfig.admin_db ] , (err, ok) ->
        t.is ok.db_name, testConfig.admin_db, "admin_db db exists"

      coux [ host, testConfig.admin_db, "_design/console" ], (err, doc) ->
        t.notOk (err and err.reason is "no_db_file"), "config db exists"
        t.notOk err, "design doc created"
        t.ok doc.views, "config ddoc exists"

      coux [ host, testConfig.users_db ], (err, ok) ->
        t.is ok.db_name, testConfig.users_db, "handshake db exists"

test "quit", process.exit
