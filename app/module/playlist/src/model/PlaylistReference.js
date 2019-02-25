/**
 *
 */
class PlaylistReference {

    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id = null, name = null) {

        /**
         * @type {null|string}
         */
        this.referenceId = id;

        /**
         * @type {null|string}
         */
        this.name = name;
    }

    /**
     * @param {Playlist} entity
     * @return {PlaylistReference}
     */
    static getReferenceFromEntity(entity) {
        return new PlaylistReference(
            entity.id,
            entity.name
        );

    }
}

module.exports = PlaylistReference;