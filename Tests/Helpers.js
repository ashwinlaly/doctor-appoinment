let Doctor = require("../Model/Doctor");
let DoctorType = require("../Model/DoctorType");

// let data = {
//     date : "2021-10-14",
//     morning_starttime : "09:30",
//     morning_endtime : "10:30",
//     evening_starttime : "17:30",
//     evening_endtime : "19:30"
// }

async function ee(){
    await DoctorType.find({}).then(data => {
       console.log(data)
    });
}

ee();
// let slot = new Slot(data);
// doctor.slot.push(slot);
