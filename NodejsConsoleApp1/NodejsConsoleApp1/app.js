// © Copyright 2014
// the current code is licensed under the GPLv3 but future versions may carry a different license
var http = require('http');

//take args from command line
var clargs = process.argv;
//first arg is Host
var controllerAddress = clargs[2];
//second arg is port
var controllerPort = clargs[3];

var groups // var for groups - used in xmlInfo
var tempSetRaw //raw temp setting converted from fahrenheit - used in xmlInfo

var xmlCommandOpt = ['getRequest','setRequest'];

function xmlPiece(xmlCommand, parent, name, values, close) {
    this.command = xmlCommand;
    this.name = name;
    this.values = values;
    this.close = close;
    this.parent = parent;
};

function xmlPieceA(parent, name, values, close) {
    var wp = new xmlPiece('getRequest', parent, name, values, close)
    this.command = wp.command;
    this.name = wp.name;
    this.values = wp.values;
    this.close = wp.close;
    this.parent = wp.parent;
};

function xmlPieceAp(parent) {
    this.p =(function f(close) {
        this.p = (function xmlPieceAA(name, values) {
            var wp = new xmlPieceA(parent, name, values, close)
            this.command = wp.command;
            this.name = wp.name;
            this.values = wp.values;
            this.close = wp.close;
            this.parent = wp.parent;
        });
        this.p2 = (function xmlPieceAA(name) {
            var wp = new xmlPieceA(parent, name, "", close)
            this.command = wp.command;
            this.name = wp.name;
            this.values = wp.values;
            this.close = wp.close;
            this.parent = wp.parent;
        });
    });
};
var SystemData = new xmlPieceAp("SystemData").p;
var SystemDataA = new SystemData(false).p;
var ControlGroup = new xmlPieceAp("ControlGroup").p;
var ControlGroupB = new ControlGroup(true).p2;
var FunctionControl = new xmlPieceAp('FunctionControl').p;
var FunctionControlB = new FunctionControl(true).p2;


var xmlInfo = { 
    databaseManager: {
        systemData: {
            //command: xmlInfo.command[0],
            version: new SystemDataA('Version',"*"),
            tempUnit: new SystemDataA('TempUnit',"*"),
            model: new SystemDataA('Model',"*"),
            filterSign: new SystemDataA('FilterSign',"*"),
            shortName: new SystemDataA('ShortName',"*"),
            dateFormat: new SystemDataA('DateFormat',"*")
        },
        controlGroup: {
            //command: xmlInfo.command[0],
            areaGroupList: new ControlGroupB('AreaGroupList'),
            areaList: new ControlGroupB('AreaList'),
            mnetGroupList: new ControlGroupB('MnetGroupList'),
            mnetList: new ControlGroupB('MnetList'),
            ddcInfoList: new ControlGroupB('DdcInfoList'),
            viewInfoList: new ControlGroupB('ViewInfoList'),
            mcList: new ControlGroupB('McList'),
            mcNameList: new ControlGroupB('McNameList'),
        },
        functionControl: {
            //command: xmlInfo.command[0],
            functionList: new FunctionControlB('FunctionList')
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
                xmlOutput = xmlOutput + attrObjArray[i].name + '/>' + '</' + element + '>';
            } else {
                xmlOutput = xmlOutput + ' ' + attrObjArray[i].name + '=' + '"' + attrObjArray[i].values + '"';
            };

        }        ;
        if (close === false) { xmlOutput = xmlOutput + ' />';};
        xmlOutput = xmlOutput + '</DatabaseManager>' + '</Packet>';
        return xmlOutput;
    }
};

var sendXml = function (body) {
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
    var buffer = "";
    
    var req = http.request(postRequest, function (res) {
        
        console.log(res.statusCode);
        var buffer = "";
        res.on("data", function (data) { buffer = buffer + data; });
        res.on("end", function (data) { console.log(buffer); });

    });
    
    console.log(body);
    req.write(body);
    req.end();
    console.log(buffer);
    return buffer
};

var xmlDbm = xmlInfo.databaseManager
var xmlSysData = xmlDbm.systemData
var xmlCtlGrp = xmlDbm.controlGroup
// fetch data for use
function singleCommand(xmlCommand) {
    this.xml = new createXml(xmlCommand.command, xmlCommand.parent , xmlCommand.close, [ { name: xmlCommand.name, values: xmlCommand.values }]).xml;
};
var xmlGetSystemData = new createXml(xmlSysData.version.command, xmlSysData.version.parent, xmlSysData.version.close, [xmlSysData.version,xmlSysData.tempUnit,xmlSysData.model,xmlSysData.filterSign,xmlSysData.shortName,xmlSysData.dateFormat]).xml;
var xmlAreaGroupList = new singleCommand(xmlCtlGrp.areaGroupList).xml;
var xmlAreaList = new singleCommand(xmlCtlGrp.areaList).xml;
var xmlGetMnetGroupList = new singleCommand(xmlCtlGrp.mnetGroupList).xml;
var xmlGetMnetList = new singleCommand(xmlCtlGrp.mnetList).xml;
var xmlGetDdcInfoList = new singleCommand(xmlCtlGrp.ddcInfoList).xml;
var xmlGetViewInfoList = new singleCommand(xmlCtlGrp.viewInfoList).xml;
var xmlGetMcList = new singleCommand(xmlCtlGrp.mcList).xml;
var xmlGetMcNameList = new singleCommand(xmlCtlGrp.mcNameList).xml;

var xmlParse = function(xmlToParse) {
    var xmlParseReturnObject = {};
    var findTag = function () {
        
    };
    for (var i = 0; i < xmlToParse.length; i++) {
        xmlToParse[i]
    };

}

var getSystemData = function () {
    var response = sendXml(xmlGetSystemData());
    // parse response
    xmlParse(response);
};

var getAreaGroupList = function () {
    var response = sendXml(xmlAreaGroupList())
    // parse response
};

var getAreaList = function () {
    var response = sendXml(xmlAreaList())
    // parse response
};

var getMnetGroupList = function () {
    var response = sendXml(xmlGetMnetGroupList());
    // parse response
};

var getMnetList = function () {
    var response = sendXml(xmlGetMnetList());
    // parse response
};

var getDdcInfoList = function () {
    var response = sendXml(xmlGetDdcInfoList());
    // parse response
};

var getViewInfoList = function () {
    var response = sendXml(xmlGetViewInfoList());
    // parse response
};

var getMcList = function () {
    var response = sendXml(xmlGetMcList());
    // parse response
};

var getMcNameList = function () {
    var response = sendXml(xmlGetMcNameList());
    // parse response
};
// code below is for testing purposes only

console.log("Connecting to", controllerAddress + ":" + controllerPort);

// the following functions work but do not return anything yet
getSystemData();
getAreaGroupList();
getAreaList();
getMnetGroupList();
getMnetList();
getDdcInfoList();
getViewInfoList();
getMcList();
getMcNameList();


 // */