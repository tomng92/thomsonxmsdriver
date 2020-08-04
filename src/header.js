/************************************************************************************
 * File: ThomsonXMS.js
 * Thomson XMS device driver.
 * 
 * Concepts:
 *    - a device is an instance of a device type. Devices are 
 *    - key alarms: device types have alarms associated with them (see thomsonAlarms.js) Those are key alarms.
 *    - non key alarms for a device: are any alarm that is not associated with the device type.
 *    - device type ANY-DEVICE: is a device type for unknown types. Any device with unknown types and exttypes will be assigned this type.
 *         The ANY-DEVICE exists because we may encounter unknown devices in the future, and we dont want to loose alarms.
 *         Devices with this type will not have Health and Signal alarms. Only the MiscAlarms (i.e. non-key alarms).
 *    - subdevices: are resources that exist in a device. The EM4008 have 8 subdevices: ENC1->ENC8.
 *        The subdevices are created using the subdeviceCreatorFunc. When an alarm or trap come, their names are
 *        extracted from the resourceId field via the resourceIdParserFunc.
 *
 * Devices are created in a hierarchy. Topology node contains information for us to construct the device hierarchy.
 * The root is always the XMS device
 * 
 *   XMS
 *     +---XMU_1
 *          +---Health
 *          |     +---Hardware Failure
 *          +---Signal
 *          |     +---Broadcast channel Failure
 *          |     +---Connection Establishment failure
 *          +---OtherAlarms (non-key)
 *          |     +---Major
 *          |     +---Warning
 *          |     +---Notice
 *          +---SubDevices
 *                +---NOC_Amethyst_01
 *                |    +---Health
 *                |    |      +---TR 101 First priority error
 *                |    |      +---High temperature
 *                |    +---Signal
 *                |    |      +---Connection Establishment failure
 *                |    |      +---No stream received
 *                |    +---Uncategorized
 *                |    |      +---Major
 *                |    |      +---Warning
 *                |    |      +---Notice
 *                |    +---SubDevices
 *                |           +---IpSwitch1
 *                |           |    +---Health
 *                |           |    +---Signal
 *                |           |         +---Signal Loss
 *                |           |         +---No stream received
 *                |           +---IpSwitch2
 *                |           +---...
 *                |           +---IpSwitch8
 *                |                +---Health
 *                |                +---Signal
 *                +---NOC_EM4000_01
 *                |    +---Health
 *                |    +---Signal
 *                |    +---OtherAlarms (non-key)
 *                |    +---SubDevices
 *                |         +---ENC1
 *                |         +---...
 *                |         +---ENC8
 *                +---NOC_EM4000_02
 *                     +---...
 *
 * 8 Nov 2013.
 */
