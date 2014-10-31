var http = require('http');

var clargs = process.argv;

var controllerAddress = clargs[2];

var controllerPort = clargs[3];
var groups 
var tempSetRaw
var createXml = function (object) {

}
var xmlInfo = {
    command: ['getRequest','setRequest'],
    databaseManager: {

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
        }
    },
    optNames: ['Command','DatabaseManager']
};

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