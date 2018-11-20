/**
 *
 */
class PaperToastNotification {

    constructor(id) {
        this.id = id;
    }

    /**
     *
     * @param text
     */
    notify(text) {

        let paperToast = document.getElementById(this.id);
        if (!paperToast) {
            console.warn('Element by id ' + this.id + ' not found');
            return;
        }

        // TODO inject Translator
        paperToast.text = text;
        paperToast.open();
    }
}

module.exports = PaperToastNotification;