import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {Listener} from '@dsign/library/src/event/Listener';
import {Localize} from '@dsign/library/src/localize/Localize';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';

/**
 *
 * @type {Function}
 */
export const LocalizeMixin = (superClass) => {

    return class extends mixinBehaviors([AppLocalizeBehavior], superClass)  {

        static get properties() {
            return {
                /**
                 * @type Localize
                 */
                _localizeService: {
                    type: Object,
                    readOnly: true,
                    notify: true,
                    observer: 'changedLocalizeService'
                }
            };
        }

        /**
         * @param newValue
         */
        changedLocalizeService(newValue) {
            if (!newValue) {
                return;
            }
            this.language = this._localizeService.getDefaultLang();
            this._evtListener = new Listener(this.changeLanguage.bind(this));
            this._localizeService.getEventManager().on(Localize.CHANGE_LANGUAGE, this._evtListener)
        }

        /**
         * @param evt
         */
        changeLanguage(evt) {
            this.language = evt.data.language;
        }
    }
};
