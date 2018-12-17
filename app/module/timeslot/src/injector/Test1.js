class Test1 extends AbstractInjector {

    constructor() {
        super();
        this.mockData = this.createMockData();

    }

    createMockString() {
        var textString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var length = Math.random() * (10 - 4) + 4;
        var mockString = '';

        for (var i = 0; i < length; i += 1) {
            var stringIndex = Math.random() * (textString.length - 0);
            mockString += textString.substring(stringIndex, stringIndex + 1);
        }

        return mockString;
    }

    createMockData(textProperty, valueProperty) {
        var data = [];

        for (var i = 0; i < 200; i += 1) {
            var mockObj = {};
            mockObj['id'] = i;
            mockObj['name'] = this.createMockString();
            mockObj['surname'] = this.createMockString();

            data.push(mockObj);
        }

        return data;
    }

    get serviceLabel() {
        return 'Test 1';
    }

    get serviceName() {
        return Test1.name;
    }

    get serviceDescription() {
        return 'Sono una descrizione';
    }

    getServiceData(value) {
        return new Promise((resolve, reject) => {
            let filter = this.mockData.filter(function (obj) {
                return obj.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
            });

            if (filter) {
                resolve(filter);
            } else {
                reject('error');
            }
        });
    }

    getTimeslotData(data) {
        return this.mockData.find((element) => {
                return data.id === element.id;
            }
        )
    }

    /**
     * @param data
     */
    extractTimeslot(data) {
        let obj = this.mockData.find(function (obj) {
            return obj.id === data.id;
        });

        if (obj) {
            return {id:obj.id}
        } else {
            return {}
        }
    }
}

module.exports = Test1;