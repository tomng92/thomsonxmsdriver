####################################################
#
# Sample SNMPv2c notification tcl commands are created from D:\SrvApps\SimpleSoft\SimpleAgentPro\cmf\ThomsonXMS3500.cmf 
#
####################################################
##TRAP=cold start
SA_sendv2ctrap { 1.3.6.1.6.3.1.1.5.1 }
##TRAP=warm start
SA_sendv2ctrap { 1.3.6.1.6.3.1.1.5.2 }
##TRAP=link down
SA_sendv2ctrap { 1.3.6.1.6.3.1.1.5.3 { 1.3.6.1.2.1.2.2.1.1.1 Integer 1 }}
##TRAP=link up
SA_sendv2ctrap { 1.3.6.1.6.3.1.1.5.4 { 1.3.6.1.2.1.2.2.1.1.1 Integer 1 }}
##TRAP=authentication failure
SA_sendv2ctrap { 1.3.6.1.6.3.1.1.5.5 }
##TRAP=egpNeighbor loss
SA_sendv2ctrap { 1.3.6.1.6.3.1.1.5.6 { 1.3.6.1.2.1.8.5.1.2.1.2.3.4 IpAddress 1.2.3.4 }}
####################################################

 
##TRAP=genTrapAlarm_EM187_Health_OutOfCpuCycles_RCA_severityMajor_5
SA_sendv2ctrap { 1.3.6.1.4.1.4947.2.14.1.1.7.2
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.1.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.2.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.1.1 Gauge 0 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.3.1 OctetString abc }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1 OctetString EM187 } 
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.5.1 OctetString "sortie rca"}
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1 Gauge 154 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.7.1 OctetString "ON" }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.8.1 OctetString severityMajor(5) }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.9.1 Integer 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.10.1 OctetString "my event label" } }
 
##TRAP=genTrapAlarm_EM187_Health_OutOfCpuCycles_RCA_severityCleared_1
SA_sendv2ctrap { 1.3.6.1.4.1.4947.2.14.1.1.7.2
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.1.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.2.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.1.1 Gauge 0 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.3.1 OctetString abc }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1 OctetString EM187 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.5.1 OctetString "sortie rca"}
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1 Gauge 154 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.7.1 OctetString "OFF" }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.8.1 OctetString "severityCleared(1)" }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.9.1 Integer 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.10.1 OctetString "my event label" } }


##TRAP=genTrapAlarm_EM187_Health_OutOfCpuCycles_RCA2_severityMajor_5
SA_sendv2ctrap { 1.3.6.1.4.1.4947.2.14.1.1.7.2
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.1.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.2.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.1.1 Gauge 0 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.3.1 OctetString abc }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1 OctetString EM187 } 
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.5.1 OctetString "sortie RCa 2"}
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1 Gauge 154 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.7.1 OctetString "ON" }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.8.1 OctetString severityMajor(5) }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.9.1 Integer 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.10.1 OctetString "my event label" } }
  





##TRAP=genTrapAlarm_EM187_Health_OutOfCpuCycles_RCA2_CLear
SA_sendv2ctrap { 1.3.6.1.4.1.4947.2.14.1.1.7.2
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.1.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.7.1.2.0 Gauge 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.1.1 Gauge 0 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.3.1 OctetString abc }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.4.1 OctetString EM187 } 
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.5.1 OctetString "sortie RCa 2"}
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.6.1 Gauge 154 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.7.1 OctetString "OFF" }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.8.1 OctetString severityMajor(5) }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.9.1 Integer 1 }
  { 1.3.6.1.4.1.4947.2.14.1.1.4.1.10.1 OctetString "my event label" } }
  






