let moment = require("moment");

class Time {
    checkIsAM(time) {
        return moment(time, "H:mm A").format("A") === "AM";
    }

    checkIsPM(time) {
        return moment(time, "H:mm A").format("A") === "PM";
    }

    formatTime(time) {
        return moment(time, "H:mm").format("H:mm");
    }
    
    isValidTime(time) {
        try {
            return moment(time, "H:mm").isValid();
        } catch(Error){
            throw new Error("Invalid time Provided");
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
                beginning_time = moment(beginning_time, "H:mm").add(10, 'minute').format("H:mm");
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