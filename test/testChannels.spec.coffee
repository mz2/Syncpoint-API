coux = require('coux').coux
userChannelControl = require '../lib/userChannelControl'
docstate = require('docstate')
testHelper = require('./testHelper')
testConfig = require('./testConfig');

# testConfig = 
#   "host" : "http://localhost:5984"
#   "control-db" : "test-control",
#   channelTemplate : "test-template"
# testDb = [testConfig.host,  testConfig["control-db"]].join '/'
# testTemplate = [testConfig.host,  testConfig["channelTemplate"]].join '/'


bindControlDb = () ->
  userChannelControl.bindToControlDb("test-control", "test-app", testConfig)
  
  control = docstate.control()
  userChannelControl.bind(control, testConfig, testConfig["control-db"])
  control.start()
  coux.subscribeDb(testDb,(change) ->
    control.handle(change.doc))

createTemplate = (cb) ->
  coux.del testTemplate, ->
    coux.put testTemplate, ->
      coux.put [testTemplate, 'test-doc'], foobar : "ok", ->
        cb()

createDatabase = (cb) ->
  coux.del testDb, ->
    coux.put testDb, ->
      cb()

describe 'userChannelControl', ->
  changesPromise = false
  it 'with a control database', ->
    createDatabase ->
      coux testDb, (err, info) ->
        expect(info.db_name).toEqual "test-control"
        changesPromise = bindControlDb(true)
        asyncSpecDone()
    asyncSpecWait()
  
  it 'with a channel template', ->
    createTemplate ->
      coux [testTemplate, 'test-doc'], (err, doc) ->
        expect(doc.foobar).toEqual "ok"
        asyncSpecDone()
    asyncSpecWait()
  
  describe "creating a channel", ->
    chId = false
    cloudDb = false
    newChannelDoc = 
      type : "channel"
      state : "new"
      
    it "with a new channel document", ->
      coux.post testDb, newChannelDoc, (err, ok) ->
        chId = ok.id
        expect(ok.id).not.toBeNull()
        asyncSpecDone()
      asyncSpecWait()
      
    it 'should update the document', ->
      testHelper.waitForDoc testDb, chId, 1, (err, doc) ->
        expect(doc.state).toEqual "ready"
        cloudDb = doc.cloud_database
        asyncSpecDone()
      asyncSpecWait()
        
    it 'should set up a cloud database', ->
      coux [testConfig.host, cloudDb], (err, info) ->
        expect(info.db_name).toEqual cloudDb
        changesPromise.stop()
        asyncSpecDone()
      asyncSpecWait()
      
    it 'should install the channel template', ->
      coux [testConfig.host, cloudDb, 'test-doc'], (err, doc) ->
        expect(doc.foobar).toEqual "ok"
        asyncSpecDone()
      asyncSpecWait()

    it '[pending] should add the user to the security object members list', ->
      coux [testConfig.host, cloudDb, '_security'], (err, doc) ->
        expect(doc.members).toBeDefined()
        # expect(doc.members.names[0]).toEqual "the user name"
        asyncSpecDone()
      asyncSpecWait()
