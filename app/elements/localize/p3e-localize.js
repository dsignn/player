import {P3EServiceInjectorElement} from '../service/p3e-service-injector';
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {Localize} from '@p3e/library/src/localize/Localize';
import {Listener} from '@p3e/library/src/event/Listener';

/**
 * @customElement
 * @polymer
 */
export class P3ELocalizeElement extends mixinBehaviors([AppLocalizeBehavior], P3EServiceInjectorElement) {

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