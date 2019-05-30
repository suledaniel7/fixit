function timeFn(hour, minute){
    hour = Number(hour);
    minute = Number(minute);
    var suffix;

    //now, to get an AM or PM value for hour
    if(hour < 12){
        suffix = 'AM';
    }
    else {
        hour = hour - 12;
        suffix = 'PM';
    }

    //here to get an 0 value for minute
    if(minute < 10){
        minute = '0'+minute;
    }

    var fullTime = hour + ":" + minute + " " + suffix;

    return fullTime;
}

module.exports = timeFn;