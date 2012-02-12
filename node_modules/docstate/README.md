# Docstate, for stately Couch stuff

A very basic state manager for document based state machines.

## Usage

Here is how you would create a useless infinite loop, all serialized through a CouchDB changes feed.

```javascript
var control = require('docstate').control();

control.safe("user", "new", function(doc){
  console.log(doc.type) // "user"
  doc.state = "old";
  // go save the doc
})

control.safe("user", "old", function(doc){
  doc.state = "new";
  // go save the doc
})

control.start()

mythicalChangesListener.onChange(function(info, doc){
  control.handle(doc)
})
```

