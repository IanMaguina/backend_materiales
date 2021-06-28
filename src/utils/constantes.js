class Constantes {
    constructor() {
        this.emptyString = "";
        this.minDate = new Date('1970-01-01 00:00:00');
        this.maxDate = new Date('9999-12-31 23:59:59');
    }
}

module.exports = new Constantes();