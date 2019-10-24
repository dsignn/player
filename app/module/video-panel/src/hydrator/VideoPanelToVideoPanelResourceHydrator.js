

class VideoPanelToVideoPanelResourceHydrator extends require("@dsign/library").hydrator.AbstractHydrator {

    /**
     * @param {object} data
     */
    extract(data) {
            throw 'TODO'
    }
    /**
     * @param {object} data
     * @param {object} object
     */
    hydrate(data, object) {
        object = object ? object : this.getTemplateObjectHydration();
       console.log('suca', object)
        return object;
    }
}

module.exports = VideoPanelToVideoPanelResourceHydrator;