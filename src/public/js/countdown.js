function contador(ID, fecha){
    fecha = new Date(fecha);
    console.log(fecha.getMonth());
    console.log(fecha.getHours());
    console.log(fecha.getSeconds());
simplyCountdown(ID, {
    year: 2022, // required
    month: 1, // required
    day: 3, // required
    hours: 11, // Default is 0 [0-23] integer
    minutes:2 , // Default is 0 [0-59] integer
    seconds: 00, // Default is 0 [0-59] integer
    words: { //words displayed into the countdown
        days: { singular: 'day', plural: 'days' },
        hours: { singular: 'hour', plural: 'hours' },
        minutes: { singular: 'minute', plural: 'minutes' },
        seconds: { singular: 'second', plural: 'seconds' }
    },
    plural: true, //use plurals
    inline: false, //set to true to get an inline basic countdown like : 24 days, 4 hours, 2 minutes, 5 seconds
    inlineClass: 'simply-countdown-inline', //inline css span class in case of inline = true
    // in case of inline set to false
    enableUtc: false, //Use UTC or not - default : false
    onEnd: function() { 
        document.getElementById('portada').classList.add('oculta');
        return; }, //Callback on countdown end, put your own function here
    refresh: 1000, // default refresh every 1s
    sectionClass: 'simply-section', //section css class
    amountClass: 'simply-amount', // amount css class
    wordClass: 'simply-word', // word css class
    zeroPad: false,
    countUp: false
});
}

contador('#cuenta','2022-12-08T09:11:08.000Z')