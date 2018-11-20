/**
 *
 */
class SoccerConfig extends PluginConfig {

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

        let hydrator = new PropertyHydrator(
            new MatchSoccer(),
            {
                enable : new NumberStrategy(),
                guestTeam : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('teamSoccerHydrator')
                ),
                homeTeam: new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('teamSoccerHydrator')
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

        this.serviceManager.get('HydratorPluginManager').set(
            'matchSoccerHydrator',
            hydrator
        );
    }

    /**
     * @private
     */
    _loadStorage() {

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        serviceManager.eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
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
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let SoccerDexieCollection = require('../soccer/src/storage/indexed-db/dexie/SoccerDexieCollection');

                            let storage = new Storage(
                                new SoccerDexieCollection(
                                    serviceManager.get('DexieManager'),
                                    SoccerConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('matchSoccerHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                SoccerConfig.NAME_SERVICE,
                                storage
                            );

                            serviceManager.set(
                                'SoccerService',
                                new SoccerService(storage)
                            );

                            serviceManager.get('TimeslotDataInjectorService')
                                .set('HomePlayerDataInjector',new HomePlayerDataInjector(
                                    serviceManager.get('SoccerService')
                                ));

                            serviceManager.get('TimeslotDataInjectorService')
                                .set('GuestPlayerDataInjector',new GuestPlayerDataInjector(
                                    serviceManager.get('SoccerService')
                                ));


                            serviceManager.get('TimeslotDataInjectorService')
                                .set('BenchPlayersDataInjector',new BenchPlayersDataInjector(
                                    serviceManager.get('SoccerService')
                                ));

                        }.bind(this)
                    );
                }
            }
        );
    }

    _loadPlayerHydrator() {

        let hydrator = new PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new NumberStrategy()
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

        this.serviceManager.get('HydratorPluginManager').set(
            'playerSoccerHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new PlayerSoccer(),
            {
                shirtNumber: new NumberStrategy(),
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

        this.serviceManager.get('HydratorPluginManager').set(
            'playerSoccerApiHydrator',
            hydrator
        );
    }

    _loadTeamHydrator() {

        this._loadPlayerHydrator();

        this._loadReplacementHydrator();

        this._loadCardHydrator();

        this._loadGoalHydrator();

        let hydrator = new PropertyHydrator(
                new TeamSoccer(),
                {
                    'players' : new HydratorStrategy(
                        this.serviceManager.get('HydratorPluginManager').get('playerSoccerHydrator')
                    ),
                    'replacemens' :  new HydratorStrategy(
                        this.serviceManager.get('HydratorPluginManager').get('replacementSoccerHydrator')
                    ),
                    'cards' :  new HydratorStrategy(
                        this.serviceManager.get('HydratorPluginManager').get('cardSoccerHydrator')
                    ),
                    'goals' :  new HydratorStrategy(
                        this.serviceManager.get('HydratorPluginManager').get('goalSoccerHydrator')
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

        this.serviceManager.get('HydratorPluginManager').set(
            'teamSoccerHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new TeamSoccer(),
            {
                'players' : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('playerSoccerApiHydrator')
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

        this.serviceManager.get('HydratorPluginManager').set(
            'teamSoccerApiHydrator',
            hydrator
        );
    }

    _loadCardHydrator() {

        let hydrator = new PropertyHydrator(
            new Card(),
            {
                time: new NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('type')
            .enableExtractProperty('time')
            .enableExtractProperty('playerId');

        hydrator.enableHydrateProperty('type')
            .enableHydrateProperty('time')
            .enableHydrateProperty('playerId');

        this.serviceManager.get('HydratorPluginManager').set(
            'cardSoccerHydrator',
            hydrator
        );
    }

    _loadGoalHydrator() {

        let hydrator = new PropertyHydrator(
            new Goal(),
            {
                time: new NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('type')
            .enableExtractProperty('time')
            .enableExtractProperty('playerId');

        hydrator.enableHydrateProperty('type')
            .enableHydrateProperty('time')
            .enableHydrateProperty('playerId');

        this.serviceManager.get('HydratorPluginManager').set(
            'goalSoccerHydrator',
            hydrator
        );
    }

    _loadReplacementHydrator() {
        let hydrator = new PropertyHydrator(
            new Replacement(),
            {
                'playerOut' : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('playerSoccerHydrator')
                ),
                'playerIn' : new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('playerSoccerHydrator')
                ),
            }
        );

        hydrator.enableExtractProperty('playerIn')
            .enableExtractProperty('playerOut')
            .enableExtractProperty('time');

        hydrator.enableHydrateProperty('playerIn')
            .enableHydrateProperty('playerOut')
            .enableHydrateProperty('time');

        this.serviceManager.get('HydratorPluginManager').set(
            'replacementSoccerHydrator',
            hydrator
        );
    }
}

module.exports = SoccerConfig;