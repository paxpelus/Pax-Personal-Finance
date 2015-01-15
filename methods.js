Meteor.methods({
  addTransaction: function (type, amount, description, tags, transDate) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    Transactions.insert({
        'type': type,
        'amount': amount,
        'description': description,
        'tags': tags,
        'transDate': new Date(transDate),
        'owner' : this.userId
    });
  },
  deleteTransaction: function (taskId) {
    Transactions.remove(taskId);
  }
});