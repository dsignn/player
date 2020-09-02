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

        return require('path').normalize(`${this.getResourceDirectory(resourceEntity)}${require('path').sep}${resourceEntity.computeName()}`);
    }

    /**
     * @param resourceEntity
     */
    getResourceDirectory(resourceEntity) {
        return  require('path').normalize(`${this.localPath}${require('path').sep}${resourceEntity.id}`);
    }
}
