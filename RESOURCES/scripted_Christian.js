/**
 * Scripted SNMP driver written by Christian.
 * 
 * Nov 11. 2013
 * 
 */

ar monMIB = "IRD4500X-MIB";
var prefixURI = "alarm://Test_Christian:10.12.173.25";
var appareil = "IRD4500X";
var interval = 5;

var puissanceSignalOID = snmp.getOID( monMIB, "signalQuality" );

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

var alarme1 = creerAlarme("Test_1", "Test_Christian/TestsBag", GSMAlarm.TYPE_STATUS);
poller.pollInterval = interval;
poller.addObjectID(puissanceSignalOID);

poller.onResult = function ( event ) {
    if ( event.success){
        controleur(alarme1, event.variables[puissanceSignalOID]);
    } else {
        log.error("Christian_[IRD4500X] - onResult even failed");
    }
}
