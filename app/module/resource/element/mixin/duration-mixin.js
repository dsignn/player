import { MultiMediaEntity } from '../../src/entity/MultiMediaEntity';
import { ImageEntity } from '../../src/entity/ImageEntity';
import { MetadataEntity } from '../../src/entity/MetadataEntity';
import { AudioEntity } from '../../src/entity/AudioEntity';
import { VideoEntity } from '../../src/entity/VideoEntity';

export const DurationMixin = (superClass) => {

    return class extends superClass {
        static get properties() {
            return {

                secondTenths: {
                    readOnly: true,
                    value: 0
                },

                second: {
                    readOnly: true,
                    value: 0
                },

                minute: {
                    readOnly: true,
                    value: 0
                },

                hour: {
                    readOnly: true,
                    value: 0
                },

                currentSecondTenths: {
                    readOnly: true,
                    value: 0
                },

                currentSecond: {
                    readOnly: true,
                    value: 0
                },

                currentMinute: {
                    readOnly: true,
                    value: 0
                },

                currentHour: {
                    readOnly: true,
                    value: 0
                },


            };
        }

        /**
         * @return {Array}
         */
        static get LIST_ROTATION() {
            return [
                VideoEntity.ROTATION_NO,
                VideoEntity.ROTATION_LOOP,
                VideoEntity.ROTATION_INFINITY
            ];
        }

        updateEntityCurrentTimeFromService(evt) {
            if (this.entity && evt.data.id !== this.entity.id) {
                return;
             }
 
             this.entity = evt.data;
             this.calcCurrentTime();
        }
        
        /**
         * Calc duration
         */
        calcTimeDuration() {
            if (!this.entity.resourceReference) {
                return;
            }

            this._setHour(~~(this.entity.resourceReference.getDuration() / 3600));
            this._setMinute(~~((this.entity.resourceReference.getDuration() % 3600) / 60));
            this._setSecond(~~this.entity.resourceReference.getDuration() % 60);

            let splitter =(this.entity.resourceReference.getDuration() + "").split(".");
            this._setSecondTenths(parseInt(splitter[1] ? splitter[1].substring(0,1) : 0));
        }

        /**
         * Calc current time
         */
        calcCurrentTime() {
            this._setCurrentHour(~~(this.entity.resourceReference.getCurrentTime() / 3600));
            this._setCurrentMinute(~~((this.entity.resourceReference.getCurrentTime() % 3600) / 60));
            this._setCurrentSecond(~~this.entity.resourceReference.getCurrentTime() % 60);

            let splitter =(this.entity.resourceReference.getCurrentTime() + "").split(".");
            this._setCurrentSecondTenths(parseInt(splitter[1] ? splitter[1] : 0));
        }

    }
}