coux = require('coux').coux
userChannelControl = require '../lib/userChannelControl'
docstate = require('docstate')
testHelper = require('./testHelper')

testAppConfig = 
  "host" : "http://localhost:5984"
  "control-db" : "test-control",
  channelTemplate : "test-template"
testDb = [testAppConfig.host,  testAppConfig["control-db"]].join '/'
testTemplate = [testAppConfig.host,  testAppConfig["channelTemplate"]].join '/'


bindControlDb = () ->
  control = docstate.control()
  userChannelControl.bind(control, testAppConfig, testAppConfig["control-db"])
  control.start()
  coux.subscribeDb(testDb,(change) ->
    control.handle(change.doc))


# waitForDoc = (db, id, seq, cb) ->
#   couxOpts = 
#     url : db+"/_changes?filter=_doc_ids&since="+seq+"&include_docs=true&feed=longpoll"
#     agent : false
#   coux.post couxOpts, {"doc_ids": [ id]}, (err, resp) ->
#     # console.log err, resp
#     cb(err, resp.results[0].doc)
#   

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
      coux [testAppConfig.host, cloudDb], (err, info) ->
        expect(info.db_name).toEqual cloudDb
        changesPromise.stop()
        asyncSpecDone()
      asyncSpecWait()
      
    it 'should install the channel template', ->
      coux [testAppConfig.host, cloudDb, 'test-doc'], (err, doc) ->
        expect(doc.foobar).toEqual "ok"
        asyncSpecDone()
      asyncSpecWait()

    it 'should add the user to the security object members list', ->
      coux [testAppConfig.host, cloudDb, '_security'], (err, doc) ->
        expect(doc.members).toBeDefined()
        # expect(doc.members.names[0]).toEqual "our user name"
        asyncSpecDone()
      asyncSpecWait()
