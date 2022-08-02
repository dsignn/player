import { ContainerAware } from "@dsign/library/src/container/index";
import { config } from './config';
import { IceHockeyMatchEntity } from "./src/entity/IceHockeyMatchEntity";
import { MongoDb } from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import { MongoIceHockeyAdapter } from "./src/storage/adapter/mongo/MongoIceHockeyAdapter";
import { PropertyHydrator } from "@dsign/library/src/hydrator/index";
import { Storage } from "@dsign/library/src/storage/Storage";
import { MapProprertyStrategy } from "@dsign/library/src/hydrator/strategy/proprerty";
import { HydratorStrategy, MongoIdStrategy } from "@dsign/library/src/hydrator/strategy/value";
import { GenericTeam } from "@dsign/library/src/sport/team/GenericTeam";
import { GenericPeriod } from "@dsign/library/src/sport/match/GenericPeriod";
import { IceHockeyPlayerEntity } from "./src/entity/IceHockeyPlayerEntity";
import { IceHockeyScore } from "./src/entity/embedded/IceHockeyScore";
import { IceHockeyScoreboardService } from "./src/IceHockeyScoreboardService";
import { ScoreboardDataInjector } from "./src/injector/ScoreboardDataInjector";
import {Repository as TimeslotRepository} from "../timeslot/repository";


/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     * Init
     */
    init() {

        this.initConfig();
        this.initEntity();
        this.initHydrator()
        this.initMongoMatchStorage();
        this.initScoreboardService();
        this.initAcl();
    }

    /**
     * Merge config
     */
    initConfig() {
        this.getContainer().set(
            'Config',
            this.getContainer().get('merge').merge(this.getContainer().get('Config'), config)
        );
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].entityService,
                new IceHockeyMatchEntity()
            );
    }

    /**
     *
     */
    initMongoMatchStorage() {

        var connectorServiceName = this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage.adapter.mongo['connection-service'];

        let loadStorage = () => {

            const adapter = new MongoIceHockeyAdapter(
                this.getContainer().get(connectorServiceName),
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage.adapter.mongo.collection
            );

            const storage = new Storage(adapter);

            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service'])
            );

            this.getContainer().get('StorageContainerAggregate').set(
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage['name-service'],
                storage
            );
        };

        if (!this.getContainer().get(connectorServiceName)) {
            return;
        }

        if (this.getContainer().get(connectorServiceName).isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get(connectorServiceName).getEventManager().on(
                MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }

    /**
     * Init
     */
    initAcl() {
        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            let resource = this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].acl.resource;
            // TODO add method on service
            aclService.addResource(resource);
            aclService.allow('guest', resource);
        }
    }

    /**
     * Init
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service'],
                Repository.getIceHockeyMatchHydrator(this.getContainer())
            );
    }

    /**
     * Init
     */
    initScoreboardService() {

        let loadIceHockeyScoreboardService = () => {
            const service = new IceHockeyScoreboardService(
                this.getContainer()
                    .get('StorageContainerAggregate')
                    .get(this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage['name-service'])
            );
        
            this.getContainer().set(
                this.getContainer().get('Config').modules['ice-hockey']['scoreboard-service'],
                service
            );

            this.getContainer().get(TimeslotRepository.TIMESLOT_INJECTOR_DATA_SERVICE)
            .set(
                'ScoreboardDataInjector',
                new ScoreboardDataInjector(service)
            );
        };

        var connectorServiceName = this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage.adapter.mongo['connection-service'];
        
        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get(connectorServiceName).isConnected()) {
            loadIceHockeyScoreboardService();
        } else {
            this.getContainer().get(connectorServiceName).getEventManager().on(
                MongoDb.READY_CONNECTION,
                loadIceHockeyScoreboardService
            );
        }
    }

    /**
     * @return PropertyHydrator
     */
    static getIceHockeyMatchHydrator(container) {

        let teamHydratorStrategy = new HydratorStrategy();
        teamHydratorStrategy.setHydrator(Repository.getIceHockeyTeamHydrator(container));

        let periodHydratorStrategy = new HydratorStrategy();
        periodHydratorStrategy.setHydrator(Repository.getIceHockeyPeriosHydrator(container));

        let scoreHydratorStrategy = new HydratorStrategy();
        scoreHydratorStrategy.setHydrator(Repository.getIceHockeyScoreHydrator(container));

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('Config').modules['ice-hockey']['ice-hockey-match'].entityService
            )
        );

        hydrator.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'));

        hydrator.addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy())
            .addValueStrategy('homeTeam', teamHydratorStrategy)
            .addValueStrategy('homeScores', scoreHydratorStrategy)
            .addValueStrategy('guestTeam', teamHydratorStrategy)
            .addValueStrategy('guestScores', scoreHydratorStrategy)
            .addValueStrategy('periods', periodHydratorStrategy)
            .addValueStrategy('currentPeriod', periodHydratorStrategy)

        return hydrator;
    }

    /**
     * @return PropertyHydrator
     */
    static getIceHockeyTeamHydrator(container) {


        let playerHydratorStrategy = new HydratorStrategy();
        playerHydratorStrategy.setHydrator(Repository.getIceHockeyPlayerHydrator(container));

        let hydrator = new PropertyHydrator(new GenericTeam());

        hydrator .addValueStrategy('players', playerHydratorStrategy)

        return hydrator;
    }

    /**
     * @return PropertyHydrator
    */
    static getIceHockeyPeriosHydrator(container) {

        let hydrator = new PropertyHydrator(new GenericPeriod());

        return hydrator;
    }

    /**
     * @return PropertyHydrator
     */
    static getIceHockeyPlayerHydrator(container) {

        let hydrator = new PropertyHydrator(new IceHockeyPlayerEntity());

        return hydrator;
    }


    /**
     * @return PropertyHydrator
     */
    static getIceHockeyScoreHydrator(container) {

        let hydrator = new PropertyHydrator(new IceHockeyScore());

        return hydrator;
    }
}