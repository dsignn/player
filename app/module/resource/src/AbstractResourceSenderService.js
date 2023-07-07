import { EventManagerAware } from "@dsign/library/src/event";
import { EventManager } from "@dsign/library/src/event/index";
import { FileEntity } from "./entity/FileEntity";
import { MultiMediaEntity } from "./entity/MultiMediaEntity";
import { MetadataEntity } from "./entity/MetadataEntity";

/**
 * @class AbstractResourceSenderService
 */
export class AbstractResourceSenderService extends EventManagerAware {

   /**
    * Name of the "message" send from sender when play resource
    *
    * @return {string}
    */
   static get PLAY() { return 'play-resource'; }

   /**
    * Name of the "message" send from sender when stop resource
    *
    * @return {string}
    */
   static get STOP() { return 'stop-resource'; }

   /**
    * Name of the "message" send from sender when pause resource
    *
    * @return {string}
    */
   static get PAUSE() { return 'pause-resource'; }

   /**
    * Name of the "message" send from sender when resume resource
    *
    * @return {string}
    */
   static get RESUME() { return 'resume-resource'; }

   /**
    * Name of the "message" send from sender when resume resource
    *
    * @return {string}
    */
   static get CHANGE_TIME() { return 'change-time-resource'; }

   /**
    * Name of the "message" send from sender when resume resource
    *
    * @return {string}
    */
   static get UPDATE_TIME() { return 'update-time-resource'; }

   /**
    * @param {Storage} resourceStorage
    * @param {Timer} timer
    * @param {AbstractSender} sender
    * @param {ContainerAggregate} dataInjectorManager
    */
   constructor(resourceStorage, timer, sender, dataInjectorManager) {

      super();

      this.resourceStorage = resourceStorage;

      this.timer = timer;

      this.sender = sender;

      this.dataInjectorManager = dataInjectorManager;

      this.eventManager = new EventManager();

      /**
        * Check if timer is inject
        */
      if (!this.timer) {
         throw 'Timer not set';
      }
   }

   /**
    * @private
    */
   _schedule() {
      throw 'Must be implements';
   }

   /**
    *
    * @param {Object} resourceSenderEntity
    * @return {boolean}
    */
   isRunning(resourceSenderEntity) {
      throw 'Must be implements';
   }

   /**
    * @param {Object} resourceSenderEntity
    */
   play(resourceSenderEntity) {
      throw 'Must be implements';
   }

   /**
    * @param {Object} resourceSenderEntity
    */
   stop(resourceSenderEntity) {
      throw 'Must be implements'
   }

   /**
    * @param {Object} resourceSenderEntity
    */
   pause(resourceSenderEntity) {
      throw 'Must be implements'
   }

   /**
    * @param resourceSenderEntity
    */
   resume(resourceSenderEntity) {
      throw 'Must be implements'
   }

   /**
    * @param {Array} dataReferences
    * @return {Promise}
    * @private
    */
   async _extractDataFromDataReferences(dataReferences) {
      let promises = [];
      let property;
      let data;

      for (let cont = 0; dataReferences.length > cont; cont++) {
         data = {};
         if (this.dataInjectorManager.has(dataReferences[cont].name)) {

            data[this.dataInjectorManager.get(dataReferences[cont].name).serviceNamespace] =
               await this.dataInjectorManager.get(dataReferences[cont].name).getTimeslotData(dataReferences[cont].data);

            promises.push(data);
         }
      }

      return Promise.all(promises);
   }

   /**
    *
    * @param resourceSenderEntity
    * @return {Object|null}
    * @private
    */
   async _synchExtractData(resourceSenderEntity) {
     
      let data = null;

      switch(true) {
         case (resourceSenderEntity.resourceReference instanceof MultiMediaEntity):
            console.log('MultiMediaEntity');
            break;
         case (resourceSenderEntity.resourceReference instanceof MetadataEntity):
            console.log('MetadataEntity');
            break;

      }

      return data;
   }

}