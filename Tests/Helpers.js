let moment = require("moment");

console.log(moment("09:30", "h:mm").isBetween(moment("09:30", "h:mm")));