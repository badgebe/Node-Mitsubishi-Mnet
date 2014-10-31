// © Copyright 2014, All rights reserved.
// Don't worry, licencing to follow - just my first piece of public code and I am not sure which licence to use.
var http = require('http');

//take args from command line
var clargs = process.argv;
//first arg is Host
var controllerAddress = clargs[2];
//second arg is port
var controllerPort = clargs[3];

var groups // var for groups - used in xmlInfo
var tempSetRaw //raw temp setting converted from fahrenheit - used in xmlInfo

var xmlInfo = {
    command: ['getRequest','setRequest'],
    databaseManager: {
        systemData: {
            command: xmlInfo.command[0],
            version: "*",
            tempUnit: "*",
            model: "*",
            filterSign: "*",
            shortName: "*",
            dateFormat: "*",
            names: ['Version','TempUnit','Model','FilterSign','ShortName','DateFormat']
        },
        controlGroup: {
            command: xmlInfo.command[0],
            areaGroupList: "",
            areaList: "",
            mnetGroupList: "",
            mnetList: "",
            ddcInfoList: "",
            viewInfoList: "",
            mcList: "",
            mcNameList: "",
            names: ['AreaGroupList','AreaList','MnetGroupList','MnetList','DdcInfoList','ViewInfoList','McList','McNameList']
        },
        functionControl: {
            command: xmlInfo.command[0],
            functionList: "",
            names: ['FunctionList']
        },
        userAuth: {
            command: xmlInfo.command[0],
            user: "", // Username
            password: "", // _hashed_ password
            passwordKey: "",
            html: '*',
            htmlKey: '*',
            availableGroup: '*',
            userCategory: '*',
            names: ['User','Password','PasswordKey','Html','HtmlKey','AvailableGroup','UserCategory']
        },
        mnetA: {
            command: xmlInfo.command[0],
            group: groups, //specify
            bulk: "*",
            energyControl: "*",
            racSW: "*",
            names: ['Group','Bulk','EnergyControl','RacSW']
        },
        setbackControlA: {
            command: xmlInfo.command[0],
            group: groups, //needs to be changed to be more specific
            state: "*",
            hold: "*",
            setTempMax: "*",
            setTempMin: "*",
            preMode: "*",
            preSetTemp: "*",
            preDriveItem: "*",
            preModeItem: "*",
            preSetTempItem: "*",
            names: ['Group','State','Hold','SetTempMax','SetTempMin','PreMode','PreSetTemp','PreDriveItem','PreModeItem','PreSetTempItem']
        },
        mnetB: {
            command: xmlInfo.command[1],
            // Params need to be filled in
            group: groups, // needs to be changed to be more specific
            drive: ['OFF','ON'],
            mode: ['COOL','DRY','FAN','HEAT'],
            setTemp: toString(tempSetRaw),
            airDirection: ['MID0','VERTICAL'],
            fanSpeed: ['AUTO','MID2','MID1','HIGH'],
            remoCon: ['PROHIBIT','PERMIT'],
            driveItem: ['CHK_OFF','CHK_ON'],
            modeItem: ['CHK_OFF','CHK_ON'],
            setTempItem: ['CHK_OFF','CHK_ON'],
            filterItem: ['CHK_OFF','CHK_ON'],
            names: ['Group','Drive','Mode','SetTemp','AirDirection','FanSpeed','RemoCon','DriveItem','ModeItem','SetTempItem','FilterItem']
        },
        setbackControlB: {
            command: xmlInfo.command[1],
            group: groups, // ...
            state: ['ON'],
            setTempMax: "", // fill in pos. toString()
            setTempMin: "", // fill in pos. toString()
            names: ['Group','State','SetTempMax','SetTempMin']
        },
        // names are for xml creation
        names: ['SystemData','ControlGroup','SetbackControl','Mnet','FunctionControl']
    },
    // names are for creating the XML
    names: ['Command','DatabaseManager']
};

// fetch data for use

function createXml(object) {
    //create the XML for POST
};

// code below is for testing purposes only
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