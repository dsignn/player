/**
 * @class
 */
class ResourceService {

    /**
     * @param localPath
     */
    constructor(localPath) {

        this.localPath = localPath;

        this.nodePath = require('path');
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

        return this.nodePath.normalize(`${this.localPath}${resourceEntity.id}${this.nodePath.sep}${resourceEntity.computeName()}`);
    }

    /**
     * @param resourceEntity
     */
    getResourceDirectory(resourceEntity) {
        return this.nodePath.normalize(`${this.localPath}${resourceEntity.id}${this.nodePath.sep}`);
    }
}

module.exports = ResourceService;
