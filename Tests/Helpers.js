let moment = require("moment");

beginning_time = "19:30";
let date = moment(beginning_time, "H:mm").add(10, 'minute').format("H:mm", {trim: true});
date = date.length === 4 ?  '0' + date: date;
console.log(date);