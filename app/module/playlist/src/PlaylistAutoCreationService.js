/**
 * @class PlaylistAutoCreationService
 */
export class PlaylistAutoCreationService {

    /**
     * @param {*} fs 
     */
    constructor(fs, fileExtension) {
        this.fs = fs;

        this.fileExtension = fileExtension;

        this.mimeTypes = [
            'webm',
            'mp4',
            'video/quicktime'
        ]
    }

    /**
     * @param {*} device 
     * @returns 
     */
    _searchMntPath(device) {
        let path = null;

        if (device.mountpoints && Array.isArray(device.mountpoints) && device.mountpoints.length > 0) {

            let mnt = device.mountpoints[0];
            if (mnt.path) {
                path = mnt.path
            }
        }

        return path;
    }

    /**
     * 
     */
    getListResource(path) {

        return new Promise((resolve, reject) => {
            let list = [];
            if (this.fs.lstatSync(path).isDirectory()) {

                this.fs.readdir(path, (err, files) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    for (let cont = 0; files.length > cont; cont++) {
                     
                        let file = `${path}/${files[cont]}`;

                        if (! (this.fs.lstatSync(file).isFile()) ||
                            (/(^|\/)\.[^\/\.]/g).test(file)) {
                            continue;
                        }

                        let split = files[cont].split('.');
                        let extension = split[split.length - 1];

                        if (this.mimeTypes.includes(extension)) {
                            list.push(files[cont]);
                        }
                      
                    }

                    resolve(list);
                })
            }
        });
    }
}