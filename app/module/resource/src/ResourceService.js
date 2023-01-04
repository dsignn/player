/**
 * @class
 */
export class ResourceService {

    /**
     *
     * @param localPath
     * @param {PathNode} path
     */
    constructor(localPath, path) {

        this.localPath = localPath;
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
}
