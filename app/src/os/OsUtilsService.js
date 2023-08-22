/**
 * @class OsUtilsService
 */
export class OsUtilsService {

    /**
     * @param {*} os 
     * @param {*} machineId 
     */
    constructor(os, machineId) {
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
                    cpu: this.os.cpus()
                }

                resolve(message)
            })
        });
    }
}