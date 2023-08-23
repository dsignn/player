/**
 * @class OsUtilsService
 */
export class OsUtilsService {

    /**
     * @param {*} os 
     * @param {*} machineId 
     * @param {*} dns 
     */
    constructor(os, machineId, dns) {

        this.os = os;

        this.machineId = machineId
    }

    /**
     * @returns object
     */
    _getMachineMessage() {

        return new Promise((resolve, reject) => {

            this.machineId().then((id) => {

                let message = {
                    id: id,
                    totalMem: this.os.totalmem(),
                    freeMem: this.os.freemem(),
                    cpu: this.os.cpus(),
                    addresses: this._getIpAddress()
                }

                resolve(message)
            })
        });
    }

    _getIpAddress() {
        var interfaces = this.os.networkInterfaces();
        
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }

        return addresses;
    }
}