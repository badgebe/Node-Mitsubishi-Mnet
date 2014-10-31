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

function xmlPiece(xmlCommand, name, value, close) {
    this.command = xmlCommand;
    this.name = name;
    this.value = value;
    this.close = close;
};
var command = ['getRequest','setRequest'];
var xmlInfo = {
    databaseManager: {
        systemData: {
            //command: xmlInfo.command[0],
            version: new xmlPiece(command[0],'Version',"*",false),
            tempUnit: new xmlPiece(command[0],'TempUnit',"*", false),
            model: new xmlPiece(command[0],'Model',"*", false),
            filterSign: new xmlPiece(command[0],'FilterSign',"*", false),
            shortName: new xmlPiece(command[0],'ShortName',"*", false),
            dateFormat: new xmlPiece(command[0],'DateFormat',"*", false)
        },
        controlGroup: {
            //command: xmlInfo.command[0],
            areaGroupList: new xmlPiece(command[0],'AreaGroupList',"", true),
            areaList: new xmlPiece(command[0],'AreaList',"", true),
            mnetGroupList: new xmlPiece(command[0],'MnetGroupList',"", true),
            mnetList: new xmlPiece(command[0],'MnetList',"", true),
            ddcInfoList: "",
            viewInfoList: "",
            mcList: "",
            mcNameList: "",
            names: ['DdcInfoList','ViewInfoList','McList','McNameList']
        },
        functionControl: {
            //command: xmlInfo.command[0],
            functionList: "",
            names: ['FunctionList']
        },
        userAuth: {
            //command: xmlInfo.command[0],
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
            //command: xmlInfo.command[0],
            group: groups, //specify
            bulk: "*",
            energyControl: "*",
            racSW: "*",
            names: ['Group','Bulk','EnergyControl','RacSW']
        },
        setbackControlA: {
            //command: xmlInfo.command[0],
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
            //command: xmlInfo.command[1],
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
            //command: xmlInfo.command[1],
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

function createXml(command, element, close, attrObjArray) {
    //create the XML for POST
    this.xml = function () {
        var xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>' + '<Packet>' + '<Command>' + command + '</Command>' + '<DatabaseManager>' + '<' + element;
        if (close) { xmlOutput = xmlOutput + '>' + '<' }        ;
        for (var i = 0; i < attrObjArray.length; i++) {
            if (close) {
                xmlOutput = xmlOutput + attrObjArray[i].name + ' />' + '</' + element + '>';
            } else {
                xmlOutput = xmlOutput + ' ' + attrObjArray[i].name + '=' + '"' + attrObjArray[i].value + '"' + ' />';
            }            ;

        }        ;
        xmlOutput = xmlOutput + '</DatabaseManager>' + '</Packet>';
        return xmlOutput;
    }
};
var xmlDbm = xmlInfo.databaseManager
var xmlSysData = xmlDbm.systemData
var xmlCtlGrp = xmlDbm.controlGroup
// fetch data for use
var getMnetGroupList = new createXml (xmlCtlGrp.mnetGroupList.command, "ControlGroup",xmlCtlGrp.mnetGroupList.close, [ { name: xmlCtlGrp.mnetGroupList.name, value: xmlCtlGrp.mnetGroupList.value}])
// code below is for testing purposes only
var testXml = getMnetGroupList.xml()
console.log(testXml)
/*
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
*/
var body = testXml
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
 