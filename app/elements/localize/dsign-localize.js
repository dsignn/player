import {DsignServiceInjectorElement} from '../service/dsign-service-injector';
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {Localize} from '@dsign/library/src/localize/Localize';
import {Listener} from '@dsign/library/src/event/Listener';

/**
 * @customElement
 * @polymer
 */
export class DsignLocalizeElement extends mixinBehaviors([AppLocalizeBehavior], DsignServiceInjectorElement) {

    static get properties () {
        return {
            localizeService: {
                type: Object,
                readOnly: true,
                observer: 'changeLocalizeService'
            }
        };
    }

    ready() {
        super.ready();

        if (window.container) {
            this._setLocalizeService(window.container.get('Localize'))
        }
    }

    /**
     * @param changeLocalizeService
     */
    changeLocalizeService(changeLocalizeService) {
        this.language = this.localizeService.getDefaultLang();
        this._evtListener = new Listener(this.changeLanguage.bind(this));
        this.localizeService.getEventManager().on(Localize.CHANGE_LANGUAGE, this._evtListener)
    }

    /**
     * @param evt
     */
    changeLanguage(evt) {
        this.language = evt.data.language;
    }
}
