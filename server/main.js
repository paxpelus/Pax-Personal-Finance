Transactions = new Mongo.Collection("transactions");

Meteor.startup(function () {
    // code to run on server at startup
});

Meteor.publish("transactions", function () {
  return Transactions.find({ owner: this.userId });
});