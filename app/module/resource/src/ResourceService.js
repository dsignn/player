
/**
 * @class ResourceService
 */
export class ResourceService {

    /**
     * @param {*} localPath 
     * @param {*} fs 
     * @param {*} mime 
     */
    constructor(localPath, fs, mime) {

        this.localPath = localPath;

        this.fs = fs;
        
        this.mime = mime;
    }

    /**
     * @returns {string}
     */
    getPath() {
        return this.localPath
    }

    /**
     * @param resourceEntity
     */
    getResourcePath(resourceEntity) {

        let computeName = typeof resourceEntity.computeName  === 'function' ? resourceEntity.computeName() : this._workAroundComputeName(resourceEntity); 
        return require('path').normalize(`${this.getResourceDirectory(resourceEntity)}${require('path').sep}${computeName}`);
    }

    /**
     * @param resourceEntity
     */
    getResourceDirectory(resourceEntity) {
        return  require('path').normalize(`${this.localPath}${require('path').sep}${resourceEntity.id}`);
    }

    /**
     * @param resourceEntity 
     * @returns 
     */
    _workAroundComputeName(resourceEntity) {

        if(resourceEntity === null || !(resourceEntity instanceof Object) || !resourceEntity.path || !resourceEntity.path.nameFile || !resourceEntity.path.extension) {
            console.warn('Wrong parameter to _workAroundComputeName');
            return;
        }

        return `${resourceEntity.path.nameFile}.${resourceEntity.path.extension}`;
    }

    getFileFromPath(path) {
        
        return new Promise((resolve, reject) => {
            var file = {};
            file.path = path;
            this.fs.promises.access(path, this.fs.constants.F_OK)
                .then((data) => {                    
                    this.fs.promises.stat(path)
                        .then((stats) => {
                            file.size = stats.size; 
                            file.type = this.mime.getType(path);
                            file.name = ResourceService.getFilename(path);
                            console.log('FILE', file);
                            resolve(file);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
            
        });
    }

    /**
     * @param {string} path 
     * @param {bool} withExtension 
     * @returns 
     */
    static getFilename(path, withExtension) {
        let name = path.split('\\').pop().split('/').pop();
        if (withExtension) {
            name = name.replace(/\.[^/.]+$/, "");
        }
        return name;
    }
}
