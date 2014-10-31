var http = require('http');

//take args from command line
var clargs = process.argv;
//first arg is Host
var controllerAddress = clargs[2];
//second arg is port
var controllerPort = clargs[3];

var groups // var for groups
var tempSetRaw //raw temp setting converted from fahrenheit

var createXml = function (object) {
    //create the XML for POST
}

var xmlInfo = {
    command: ['getRequest','setRequest'],
    databaseManager: {
        //xml attr SBCtl
        //SetbackControl is for status requests
        //mnet is for controlling
        mnet: {
            group: groups,
            drive: ['OFF','ON'],
            mode: ['COOL','DRY','FAN','HEAT'],
            setTemp: toString(tempSetRaw),
            airDirection: ['MID0'],
            fanSpeed: ['AUTO','MID2','MID1','HIGH'],
            remoCon: ['PROHIBIT','PERMIT'],
            driveItem: ['CHK_OFF','CHK_ON'],
            modeItem: ['CHK_OFF','CHK_ON'],
            setTempItem: ['CHK_OFF','CHK_ON'],
            filterItem: ['CHK_OFF','CHK_ON'],
            names: ['Group','Drive','Mode','SetTemp','AirDirection','FanSpeed','RemoCon','DriveItem','ModeItem','SetTempItem','FilterItem']
        },
        // names are for xml creation
        names: ['Mnet']
    },
    // names are for creating the XML
    names: ['Command','DatabaseManager']
};
// code below is testing purposes only
var ctl = {
    command: 'setRequest',
    group: '3',
    drive: 'ON',
    mode: 'HEAT',
    airDirection: 'MID0',
    fanSpeed: 'MID1',
    remoCon: 'PROHIBIT',
    driveItem: 'CHK_ON',
    modeItem: 'CHK_ON',
    setTempItem: 'CHK_ON',
    filterItem: 'CHK_ON',
    setTemp: '22.5',
};


var body = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<Packet>' +
            '<Command>' +
            ctl.command +
            '</Command>' +
            '<DatabaseManager>' +
            '<Mnet Group="' + ctl.group +'" Drive="' + ctl.drive + '" Mode="' + ctl.mode +'" AirDirection="' + ctl.airDirection +'" FanSpeed="' + ctl.fanSpeed + '" RemoCon="' + ctl.remoCon + '" DriveItem="' + ctl.driveItem + '" ModeItem="' + ctl.modeItem + '" SetTempItem="' + ctl.setTempItem + '" FilterItem="' + ctl.filterItem + '" />' +
            '</DatabaseManager>' +
            '</Packet>';
console.log(body)
var postRequest = {
    host: controllerAddress,
    path: "/servlet/MIMEReceiveServlet",
    port: controllerPort,
    method: "POST",
    headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(body)
    }
};

console.log("Connecting to", controllerAddress + ":" + controllerPort);

var buffer = "";

var req = http.request(postRequest, function (res) {
    
    console.log(res.statusCode);
    var buffer = "";
    res.on("data", function (data) { buffer = buffer + data; });
    res.on("end", function (data) { console.log(buffer); });

});

req.write(body);
req.end();
console.log(buffer);