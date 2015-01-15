Handlebars.registerHelper("formatDate", function(transDate) {
    return moment(transDate).format("DD.MMM.YYYY");
});

Handlebars.registerHelper("minus", function(n1, n2) {
    return (parseFloat(n1) - parseFloat(n2)).toFixed(2);
});