Meteor.subscribe("transactions");

Transactions = new Mongo.Collection("transactions");



//On Home Load
Template.dashboard.rendered = function() {
  
    $.stellar({
				horizontalScrolling: false,
				verticalOffset: 40
			});
}


//On Dashboard Load
Template.dashboard.rendered = function() {
    $('.datetimepicker').datetimepicker({
      pickTime:false,
      defaultDate: moment()
    });
    
    $(".tags").tagsinput();
}


Template.dashboard.helpers({
  transactions: function () {
      return Transactions.find({'owner': Meteor.userId()}, {sort: {transDate: -1}});
  },
  incomes: function () {
      var total = 0;
      
      Transactions.find({'owner': Meteor.userId(), 'type': 'income'}).map( function(doc){
        total += parseFloat(doc.amount);
      });
      
      return total.toFixed(2);
  },
  expenses: function () {
      var total = 0;
      
      Transactions.find({'owner': Meteor.userId(), 'type': 'expense'}).map( function(doc){
        total += parseFloat(doc.amount);
      });
      
      return total.toFixed(2);
  }
});
  

Template.dashboard.events({
  "submit .transaction": function (event) {
    
    $(".alert").hide();
    
    var type = $(".transaction .type").val();
    var amount = $(".transaction .amount").val();
    var description = $(".transaction .description").val();
    var tags = $(".transaction .tags").val();
    var transDate = $(".transaction .transDate").val();
    
    if(isNaN(amount) || !amount){
      $(".alert").html("The amount is not valid").show();
      return false;
    }
    
    if(!moment(transDate).isValid())
    {
      $(".alert").html("Enter a valid date").show();
      return false;
    }
    
    
    Meteor.call("addTransaction", type, amount, description, tags, transDate);
    
    // Clear form
    $(".transaction .type").val("income");
    $(".transaction .amount").val("");
    $(".transaction .description").val("");
    $('.tags').tagsinput('removeAll');
    $('.datetimepicker').data("DateTimePicker").setDate(moment()); 
    
    // Prevent default form submit
    return false;
  },
  "click .delete-transaction": function () {
      Meteor.call("deleteTransaction", this._id);
  }
});

//Check Login Status
Tracker.autorun(function(){
  if(Meteor.user()){
    Router.go("/dashboard");
  }
  else{
    Router.go("/");
  }
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});