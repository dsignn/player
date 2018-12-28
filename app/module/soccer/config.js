/**
 *
 */
class SoccerConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'match.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'match.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'match'; };

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                }
            }
        }
    }

    /**
     * @private
     */
    _loadHydrator() {

        /**
         *
         */
        this._loadTeamHydrator();

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new MatchSoccer(),
            {
                enable : new dsign.hydrator.strategy.NumberStrategy(),
                guestTeam : new dsign.hydrator.strategy.HydratorStrategy(
                    this.getServiceManager().get('HydratorPluginManager').get('teamSoccerHydrator')
                ),
                homeTeam: new dsign.hydrator.strategy.HydratorStrategy(
                    this.getServiceManager().get('HydratorPluginManager').get('teamSoccerHydrator')
                )
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('place')
            .enableExtractProperty('date')
            .enableExtractProperty('time')
            .enableExtractProperty('enable')
            .enableExtractProperty('guestTeam')
            .enableExtractProperty('homeTeam');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('place')
            .enableHydrateProperty('date')
            .enableHydrateProperty('time')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('guestTeam')
            .enableHydrateProperty('homeTeam');

        this.getServiceManager().get('HydratorPluginManager').set(
            'matchSoccerHydrator',
            hydrator
        );
    }

    /**
     * @private
     */
    _loadStorage() {
        this.getServiceManager().eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (evt.data.name === 'DexieManager') {
                    this.getServiceManager().get('DexieManager').pushSchema(
                        {
                            "name": SoccerConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "place", "date", "homeTeam", "guestTeam", "enable", "status"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let SoccerDexieCollection = require('../soccer/src/storage/indexed-db/dexie/SoccerDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new SoccerDexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    SoccerConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('matchSoccerHydrator')
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                SoccerConfig.NAME_SERVICE,
                                storage
                            );

                            this.getServiceManager().set(
                                'SoccerService',
                                new SoccerService(storage)
                            );

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('HomePlayerDataInjector',new HomePlayerDataInjector(
                                    this.getServiceManager().get('SoccerService')
                                ));

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('GuestPlayerDataInjector',new GuestPlayerDataInjector(
                                    this.getServiceManager().get('SoccerService')
                                ));

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('BenchPlayersDataInjector',new BenchPlayersDataInjector(
                                    this.getServiceManager().get('SoccerService')
                                ));

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('LastCardsDataInjector',new LastCardsDataInjector(
                                    this.getServiceManager().get('SoccerService')
                                ));

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('LastGoalDataInjector',new LastGoalDataInjector(
                                    this.getServiceManager().get('SoccerService')
                                ));

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('LastReplacementDataInjector',new LastReplacementDataInjector(
                                    this.getServiceManager().get('SoccerService')
                                ));

                        }
                    );
                }
            }
        );
    }

    _loadPlayerHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('surname')
            .enableExtractProperty('shirtName')
            .enableExtractProperty('shirtNumber')
            .enableExtractProperty('position')
            .enableExtractProperty('nationality')
            .enableExtractProperty('goals')
            .enableExtractProperty('status');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('surname')
            .enableHydrateProperty('shirtName')
            .enableHydrateProperty('position')
            .enableHydrateProperty('shirtNumber')
            .enableHydrateProperty('nationality')
            .enableHydrateProperty('goals')
            .enableHydrateProperty('status')
        ;

        this.getServiceManager().get('HydratorPluginManager').set(
            'playerSoccerHydrator',
            hydrator
        );

        hydrator = new dsign.hydrator.PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new dsign.hydrator.strategy.NumberStrategy(),
            },
            {
                identifier : 'id',
                number: "shirtNumber",
                fullname: "surname"
            }
        );

        hydrator.enableExtractProperty('identifier')
            .enableExtractProperty('name')
            .enableExtractProperty('surname')
            .enableExtractProperty('shirtName')
            .enableExtractProperty('shirtNumber')
            .enableExtractProperty('position')
            .enableExtractProperty('nationality')
            .enableExtractProperty('goals');

        hydrator.enableHydrateProperty('identifier')
            .enableHydrateProperty('name')
            .enableHydrateProperty('fullname')
            .enableHydrateProperty('shirtName')
            .enableHydrateProperty('position')
            .enableHydrateProperty('number')
            .enableHydrateProperty('nationality')
            .enableHydrateProperty('goals');

        this.getServiceManager().get('HydratorPluginManager').set(
            'playerSoccerApiHydrator',
            hydrator
        );
    }

    _loadTeamHydrator() {

        this._loadPlayerHydrator();

        this._loadReplacementHydrator();

        this._loadCardHydrator();

        this._loadGoalHydrator();

        let hydrator = new dsign.hydrator.PropertyHydrator(
                new TeamSoccer(),
                {
                    'players' : new dsign.hydrator.strategy.HydratorStrategy(
                        this.getServiceManager().get('HydratorPluginManager').get('playerSoccerHydrator')
                    ),
                    'replacemens' :  new dsign.hydrator.strategy.HydratorStrategy(
                        this.getServiceManager().get('HydratorPluginManager').get('replacementSoccerHydrator')
                    ),
                    'cards' :  new dsign.hydrator.strategy.HydratorStrategy(
                        this.getServiceManager().get('HydratorPluginManager').get('cardSoccerHydrator')
                    ),
                    'goals' :  new dsign.hydrator.strategy.HydratorStrategy(
                        this.getServiceManager().get('HydratorPluginManager').get('goalSoccerHydrator')
                    ),
                }
            );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('logo')
            .enableExtractProperty('players')
            .enableExtractProperty('staff')
            .enableExtractProperty('replacemens')
            .enableExtractProperty('cards')
            .enableExtractProperty('goals');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('log')
            .enableHydrateProperty('players')
            .enableHydrateProperty('staff')
            .enableHydrateProperty('replacemens')
            .enableHydrateProperty('cards')
            .enableHydrateProperty('goals');

        this.getServiceManager().get('HydratorPluginManager').set(
            'teamSoccerHydrator',
            hydrator
        );

        hydrator = new dsign.hydrator.PropertyHydrator(
            new TeamSoccer(),
            {
                'players' : new dsign.hydrator.strategy.HydratorStrategy(
                    this.getServiceManager().get('HydratorPluginManager').get('playerSoccerApiHydrator')
                ),
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('logo')
            .enableExtractProperty('players')
            .enableExtractProperty('staff');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('log')
            .enableHydrateProperty('players')
            .enableHydrateProperty('staff');

        this.getServiceManager().get('HydratorPluginManager').set(
            'teamSoccerApiHydrator',
            hydrator
        );
    }

    _loadCardHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Card(),
            {
                time: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('type')
            .enableExtractProperty('time')
            .enableExtractProperty('playerId');

        hydrator.enableHydrateProperty('type')
            .enableHydrateProperty('time')
            .enableHydrateProperty('playerId');

        this.getServiceManager().get('HydratorPluginManager').set(
            'cardSoccerHydrator',
            hydrator
        );
    }

    _loadGoalHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Goal(),
            {
                time: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('type')
            .enableExtractProperty('time')
            .enableExtractProperty('playerId');

        hydrator.enableHydrateProperty('type')
            .enableHydrateProperty('time')
            .enableHydrateProperty('playerId');

        this.getServiceManager().get('HydratorPluginManager').set(
            'goalSoccerHydrator',
            hydrator
        );
    }

    _loadReplacementHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Replacement()
        );

        hydrator.enableExtractProperty('playerIdIn')
            .enableExtractProperty('playerIdOut')
            .enableExtractProperty('time');

        hydrator.enableHydrateProperty('playerIdIn')
            .enableHydrateProperty('playerIdOut')
            .enableHydrateProperty('time');

        this.getServiceManager().get('HydratorPluginManager').set(
            'replacementSoccerHydrator',
            hydrator
        );
    }
}

module.exports = SoccerConfig;