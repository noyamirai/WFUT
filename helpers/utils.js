// SOURCE: chat.openai.com/chat
// dateString = yyyy-mm-dd
const getFormattedDate = (dateString, shortDay = false) => {
    const dateToConvert = new Date(dateString); // create a Date object from the string

    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    const isWithinCurrentWeek = dateToConvert >= firstDay && dateToConvert <= lastDay;

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; // array of days of the week

    if (shortDay && !isWithinCurrentWeek) {
        daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // array of days of the week
    }

    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // array of months

    const dayOfWeek = daysOfWeek[dateToConvert.getDay()]; // get the day of the week (e.g. "Sun")
    const dayOfMonth = dateToConvert.getDate(); // get the day of the month (e.g. 1, 2, 3, etc.)
    const month = monthsOfYear[dateToConvert.getMonth()]; // get the month (e.g. "January")

    if (today == dateToConvert) {
        return 'Today';

    } else if (isWithinCurrentWeek && shortDay) {
        return dayOfWeek;

    } else if (isWithinCurrentWeek) {
        return 'This week';   
    }

    return `${dayOfWeek}, ${dayOfMonth} ${month}`; // combine the components into a string
}

const getFormattedTime = (timeString) => {

    // Parse the timestamp string into a Date object
    const timestamp = new Date(timeString);

    // Get the UTC timestamp value in milliseconds
    const utcTimestamp = timestamp.getTime();

    // Get the local time zone offset in milliseconds
    const localOffset = new Date().getTimezoneOffset() * 60 * 1000;

    // Calculate the local timestamp value in milliseconds by adding the UTC timestamp value and the local offset
    const localTimestamp = utcTimestamp + localOffset;

    // Create a new Date object using the local timestamp value
    const localDate = new Date(localTimestamp);

    // Get the local date and time components as strings
    const options = { hour12: false, hour: '2-digit', minute: '2-digit' };
    const localTimeString = localDate.toLocaleTimeString([], options);

    return localTimeString;
}

const getLocalTime = (timeStamp) => {
    timeStamp = new Date(timeStamp);
    var newDate = new Date(timeStamp.getTime()+timeStamp.getTimezoneOffset()*60*1000);

    var offset = timeStamp.getTimezoneOffset() / 60;
    var hours = timeStamp.getHours();

    newDate.setHours(hours - offset);

    const result = getFormattedTime(newDate);
    return result;
}

const getResultKey = (data) => {
    let objectKey;

    for (const key in data) {
        objectKey = Object.keys(data)[0];
    }

    return objectKey;
}

const sortByDate = (a, b) => {
    return new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime();
} 

const sortByTime = (array) => {
    const result = array.sort((a, b) => {
        if (a['localTime'] < b['localTime']) return -1;
        if (a['localTime'] > b['localTime']) return 1;
        return 0
    });

    return result;
}

export { getFormattedDate, getFormattedTime, getLocalTime, sortByDate, sortByTime, getResultKey };