/**
 * Scripted poller for Thomson originally written by Christian.
 * 
 * Nov 11. 2013
 * than nguyen
 * 
 */

var monMIB = "XMS3500-MIB";
var prefixURI = "alarm://Test_Thnah:10.12.175.1"; // pratesh
var appareil = "IRD4500X";
var interval = 5;

var genAlarmOriginOID = snmp.getOID( monMIB, "genAlarmOrigin" );
log.error(" +++++++++++genAlarmOriginOID>>>>: "+ genAlarmOriginOID);
var genAlarmResourceIdOID = snmp.getOID( monMIB, "genAlarmResourceId" );
log.error(" +++++++++++genAlarmResourceIdOID>>>>: "+ genAlarmResourceIdOID);
var genAlarmIndexOID = snmp.getOID( monMIB, "genAlarmIndex" );

var sysuptime_OID = snmp.getOID("RFC1213-MIB", "sysUpTime");


var controleur = function (monalarme, valeurAffecter){

    if(valeurAffecter <= 5) {
        monalarme.status = monalarme.pending;
    }else if( ( valeurAffecter >= 6) && (valeurAffecter <= 30) ) {
        monalarme.status = monalarme.MINOR;
    }else if( ( valeurAffecter >= 31) && (valeurAffecter <= 60) ) {
        monalarme.status = monalarme.NORMAL;
    }else if( ( valeurAffecter >= 61) && (valeurAffecter <= 75) ) {
        monalarme.status = monalarme.MAJOR;
    }else if( ( valeurAffecter >= 76) && (valeurAffecter <= 100) ) {
        monalarme.status = monalarme.CRITICAL;
    }else {
        monalarme.status = monalarme.UNKNOWN;
    }
};


function creerAlarme (nomAlarme, cheminVersAlarme, alarmType) {
    return gsm.addAlarm(prefixURI+"/"+nomAlarme,    //alarmURI
               nomAlarme,                           //alarmName
               cheminVersAlarme,                    //path
               appareil,                            //deviceClass
               prefixURI,                           //deviceURI
               alarmType );                         //type
}

var alarme1 = creerAlarme("Test_1", "Test_Thanh/TestsBag", GSMAlarm.TYPE_STATUS);
poller.pollInterval = interval;
poller.addObjectID(sysuptime_OID);
//poller.addObjectID(genAlarmIndexOID);

poller.onResult = function ( event ) {

    if ( event.success){
        log.error("Il est invoked!!!");
        log.error(">>>>sysuptime_OID:" + event.variables[sysuptime_OID]);
        
        for ( var ii in event.variables) {
            log.warn("Variable " + ii + " : " + event.variables[ii]);
        }
    } else {
        //Error communicating with device...
        log.error(host + ": " + "Error: " + event.error);
        //this.plugin.commStatus.status = alarm.ERROR;

    }
};
