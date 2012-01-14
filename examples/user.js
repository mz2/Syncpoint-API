// this is pseudocode...
Syncpoint.getCurrentUser(function(err, user) {
    if (user.paired.length > 0) {
        userReady(err, user);
    } else {
        Syncpoint.pairWithFacebook(user, userReady);
    }
});

user = Syncpoint.getCurrentUser();
if (user.paired) {
    userReady(user);
} else {
    pairedUser = Syncpoint.pairWithFacebook(user);
    userReady(pairedUser);
}

function userReady(user) {
    channel = user.getChannel("bay-area-sales-team");
    channel.view("recent-leads")
    //=> {"rows": [
    //      {"key": "acme-company", "value" : {"rep" : "Mark"}},
    //      {"key": "beta-group", "value" : {"rep" : "Steven"}}
    //  ]}
};

function inviteFriend(channel) {
    channel.members 
    //=> ["mark@couchbase.com","steven@couchbase.com"]
    invite = channel.invite("jchris@couchbase.com")
    channel.members 
    //=> ["mark@couchbase.com","steven@couchbase.com",
    //   "jchris@couchbase.com"]
}


