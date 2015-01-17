Handlebars.registerHelper("formatDate", function(transDate) {
    return moment(transDate).format("DD.MMM.YYYY");
});

Handlebars.registerHelper("minus", function(n1, n2) {
    return (parseFloat(n1) - parseFloat(n2)).toFixed(2);
});

Handlebars.registerHelper('isCurrentMonth',function(input){
    
  if(Session.get("currentMonth")==input.toString())
  {
      return "selected";
  }
});

Handlebars.registerHelper('getCurrentMonth',function(input){
    
  return Session.get("currentMonth");
});
