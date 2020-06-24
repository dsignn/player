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

        this.nodePath = path;
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
