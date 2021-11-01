let moment = require("moment");
const DATE_FORMAT = "YYYY-MM-DD";

class Time {
    checkIsAM(time) {
        try {
            return moment(time, "H:mm A").format("A") === "AM";
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }

    checkIsPM(time) {
        try {
            return moment(time, "H:mm A").format("A") === "PM";
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }

    dateTimeToUnix(date, time) {
        try {
            if(this.isValidTime(time) && this.isValidDate(date)) {
                return moment(date+' '+time).unix();
            } else {
                return '';
            }
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }

    UnixToTime(unix) {
        try {
            return moment.unix(unix).format("H:mm");
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }

    UnixToDate(unix) {
        try {
            return moment.unix(unix).format(DATE_FORMAT);
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }

    formatTime(time) {
        try {
            return moment(time, "H:mm").format("H:mm");
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }
    
    isValidTime(time) {
        try {
            return moment(time, "H:mm").isValid();
        } catch(Error){
            throw new Error("Invalid time Provided");
        }
    }

    isValidDate(date) {
        try {
            let validDate = moment(date, DATE_FORMAT);
            return moment(validDate).isValid();
        } catch(Error){
            throw new Error("Invalid Date Provided");
        }
    }

    isAfter(start_time, end_time) {
        if(this.isValidTime(start_time) && this.isValidTime(end_time)) {
            return moment(start_time, "h:mm").isAfter(moment(end_time, "h:mm"));
        } else {
            return false;
        }
    }

    isBefore(start_time, end_time) {
        if(this.isValidTime(start_time) && this.isValidTime(end_time)) {
            return moment(start_time, "h:mm").isBefore(moment(end_time, "h:mm"));
        } else {
            return false;
        }
    }

    isStartAndEndCorrect(startTime, endTime) {
        try {
            if(this.isValidTime(startTime) && this.isValidTime(endTime)) {
                let end_Time = moment(endTime, 'h:mma');
                let beginningTime = moment(startTime, 'h:mma');
                return beginningTime.isBefore(end_Time) || false;
            } else {
                throw new Error("Invalid time Provided");   
            }
        } catch(Error){
            throw new Error("Start time should be less than End");
        }
    }

    addMinutesToTime(time, salt) {
        return moment(time, "H:mm").add(salt, 'minute').format("H:mm");
    }

    addSecondsToTime(time, salt) {
        return moment(time, "H:mm").add(salt, 'seconds').format("H:mm");
    }

    generateTime(startTime, endTime) {
        let Times = [];
        let end_time = endTime;
        let beginning_time = startTime;
        Times.push(beginning_time);
        try {
            while(this.isStartAndEndCorrect(beginning_time, end_time)) {
                beginning_time = moment(beginning_time, "H:mm").add(30, 'minute').format("H:mm");
                beginning_time = beginning_time.length === 4 ?  '0' + beginning_time: beginning_time;
                Times.push(beginning_time);
            }
            return Times;
        } catch(error) {
            return error;
        }
    }
}

module.exports = new Time();