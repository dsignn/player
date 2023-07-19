import { MultiMediaEntity } from '../../src/entity/MultiMediaEntity';
import { ImageEntity } from '../../src/entity/ImageEntity';
import { MetadataEntity } from '../../src/entity/MetadataEntity';
import { AudioEntity } from '../../src/entity/AudioEntity';
import { VideoEntity } from '../../src/entity/VideoEntity';
import { AbstractResourceSenderService } from '../../src/AbstractResourceSenderService';

export const ActionsMixin = (superClass) => {

    return class extends superClass {

        /**
         * @param {CustomEvent} evt 
         */
        updateEntityFromService(evt) {
           
            if (this.entity && evt.data.resource.id !== this.entity.id) {
               return;
            }

            this.entity = evt.data.resource;
            this.updateStatusHtml();
            this.updateActionIcons();
        }

        /**
         * @private
         */
        updateActionIcons() {
            switch (true) {
                case this.entity.getStatus() === 'running':
                    
                    this.hideCrud = true;
                    this.$.contextIcon.disabled = true;
                    this.$.rotationIcon.disabled = true;

                    this.$.play.disabled = true;
                    this.$.stop.disabled = false;
                    this.$.pause.disabled = this.entity.rotation === 'rotation-infinity' ? true : false;
                    break;

                case this.entity.getStatus()  === 'pause':

                    this.hideCrud = false;
                    this.$.contextIcon.disabled = false;
                    this.$.rotationIcon.disabled = false;

                    this.$.play.disabled = false;
                    this.$.stop.disabled = false;
                    this.$.pause.disabled = true;
                    break;

                default:
                    
                    this.hideCrud = false;
                    this.$.contextIcon.disabled = false;
                    this.$.rotationIcon.disabled = false;

                    this.$.play.disabled = false;
                    this.$.stop.disabled = true;
                    this.$.pause.disabled = true;
            }
        }

        /**
         * Update style status
         */
        updateStatusHtml() {
            if (!this.entity.resourceReference) {
                return;
            }

            this.$.status.className = '';
            this.$.status.classList.add(this.entity.getStatus());
            this.$.status.innerHTML = this.localize(this.entity.getStatus());
        }

        /**
         * @param evt
         * @private
         */
        _play(evt) {
            if (this.entity && this.entity.getStatus() === VideoEntity.IDLE) {
                this.dispatchEvent(new CustomEvent('play', { detail: this.entity }));
            } else {
                this.dispatchEvent(new CustomEvent('resume', { detail: this.entity }));
            }
        }

        /**
         * @param evt
         * @private
         */
        _stop(evt) {
            this.dispatchEvent(new CustomEvent('stop', { detail: this.entity }));
        }

        /**
         * @param evt
         * @private
         */
        _pause(evt) {
            this.dispatchEvent(new CustomEvent('pause', { detail: this.entity }));
        }

    }
}