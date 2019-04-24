/**
 *
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
     * @param resourceEntity
     */
    getResourcePath(resourceEntity) {

        return this.nodePath.normalize(`${this.localPath}${this.nodePath.sep}${resourceEntity.id}${this.nodePath.sep}${resourceEntity.computeName()}`);
    }

    /**
     * @param resourceEntity
     */
    getResourceDirectory(resourceEntity) {
        return this.nodePath.normalize(`${this.localPath}${this.nodePath.sep}${resourceEntity.id}${this.nodePath.sep}`);
    }
}

module.exports = ResourceService;