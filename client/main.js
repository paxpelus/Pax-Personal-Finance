Meteor.subscribe("transactions");

Transactions = new Mongo.Collection("transactions");

//On Home Load
Template.home.rendered = function() {
  
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
  //Get all transaction for current user and selected month
  transactions: function () {
    
      //if Session (currentMonth) does not exist then create it
      checkSession();
      
      return Transactions.find({'owner': Meteor.userId(), 'currentMonth': Session.get("currentMonth")}, {sort: {transDate: -1}});
  },
  //Get income total for current month
  incomes: function () {
      var total = 0;
      
      Transactions.find({'owner': Meteor.userId(), 'type': 'income', 'currentMonth': Session.get("currentMonth")}).map( function(doc){
        total += parseFloat(doc.amount);
      });
      
      return total.toFixed(2);
  },
  //Get expense total for current month
  expenses: function () {
      var total = 0;
      
      Transactions.find({'owner': Meteor.userId(), 'type': 'expense', 'currentMonth': Session.get("currentMonth")}).map( function(doc){
        total += parseFloat(doc.amount);
      });
      
      return total.toFixed(2);
  },
  //Get total available months
  months: function () {
      
      return _.uniq(Transactions.find({'owner': Meteor.userId()}, {
          sort: {transDate: -1}, fields: {currentMonth: true}
      }).fetch().map(function(x) {
          return x.currentMonth;
      }), true);
      
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
    
    var currentMonth = moment(transDate).format('MMMM YYYY');
    
    Session.set("currentMonth", currentMonth);
    
    Meteor.call("addTransaction", type, amount, description, tags, transDate, currentMonth);
    
    clearForm();
    
    // Prevent default form submit
    return false;
  },
  "click .delete-transaction": function () {
      Meteor.call("deleteTransaction", this._id);
      
      checkAfterDelete();
  },
  "click .edit-transaction": function () {
    
      clearForm();
      
      var transaction = Transactions.findOne({'owner' : Meteor.userId(), '_id': this._id} , { sort : {transDate: -1}});
      
      $(".type").val(transaction.type);
      $(".amount").val(transaction.amount);
      $(".description").val(transaction.description);
      $('.datetimepicker').data("DateTimePicker").setDate(transaction.transDate); 
      
      if(transaction.tags)
      {
        for(var i=0 ; i<transaction.tags.length; i++)
        {
          $(".tags").tagsinput('add', transaction.tags[i]);  
        }
      }
      
      $(".transaction-id").val(this._id);
      
      $(".block-save-transaction").hide();
      $(".block-edit-transaction").show();
  },
  "click .btn-edit-transaction": function () {
    
    $(".alert").hide();
    
    var type = $(".transaction .type").val();
    var amount = $(".transaction .amount").val();
    var description = $(".transaction .description").val();
    var tags = $(".transaction .tags").val();
    var transDate = $(".transaction .transDate").val();
    var id = $(".transaction-id").val();
    
    if(isNaN(amount) || !amount){
      $(".alert").html("The amount is not valid").show();
      return false;
    }
    
    if(!moment(transDate).isValid())
    {
      $(".alert").html("Enter a valid date").show();
      return false;
    }
    
    var currentMonth = moment(transDate).format('MMMM YYYY');
    
    Session.set("currentMonth", currentMonth);
    
    Meteor.call("updateTransaction", id, type, amount, description, tags, transDate, currentMonth);
    
    clearForm();
    
    $(".block-save-transaction").show();
    $(".block-edit-transaction").hide();
    
    // Prevent default form submit
    return false;
    
  },
  "click .btn-cancel-edit-transaction": function () {
    
    clearForm();
    
    $(".block-save-transaction").show();
    $(".block-edit-transaction").hide();
    
    // Prevent default form submit
    return false;
    
  },
  "change .currentMonth": function (event) {
      Session.set("currentMonth", $(event.target).val());
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


function clearForm()
{
  // Clear form
  $(".transaction .type").val("income");
  $(".transaction .amount").val("");
  $(".transaction .description").val("");
  $('.tags').tagsinput('removeAll');
  $('.datetimepicker').data("DateTimePicker").setDate(moment()); 
  $(".transaction-id").val("");
}

//Check the session and create current month if it does not exist
function checkSession()
{
  if(!Session.get("currentMonth"))
  {
    var latestTransaction = Transactions.findOne({'owner' : Meteor.userId()} , { sort : {transDate: -1}});
    
    if(latestTransaction) 
    {
      Session.set("currentMonth", latestTransaction.currentMonth);
    }
    else
    {
      Session.set("currentMonth", moment().format('MMMM YYYY'));
    }
  }
  
}

//When deleting a transaction check if there are more transactions for current month else delete session and recreate it
function checkAfterDelete()
{
  var transactions = Transactions.findOne({'owner' : Meteor.userId(), 'currentMonth': Session.get("currentMonth")} , { sort : {transDate: -1}})
  
  if(!transactions)
  {
    delete Session.keys['currentMonth'];
    
    checkSession();
  }
}