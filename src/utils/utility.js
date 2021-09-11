const bigDecimal = require('js-big-decimal');
const winston = require('../utils/winston');
const utility = {};

let unoBd = new bigDecimal('1');

utility.validateStringDateYYYYMMDDConGuion = (stringDate) => {
    try {
        // stringDate: YYYY-MM-DD
        const fecha = new Date(stringDate);
        return fecha > constantes.minDate && fecha < constantes.maxDate;
    } catch (error) {
        error.stack = "\nError en utility.validateStringDateYYYYMMDDConGuion, " + error.stack;
        throw error;
    }
}

utility.isNumericValue = (paramValue) => {
    try {
        if ((typeof paramValue) === 'string' || (typeof paramValue) === 'number') {
            //winston.info("paramValue: "+paramValue);
            const bdVar = new bigDecimal(paramValue);
            //winston.info("bdVar: "+bdVar.getValue());
            return true;
        } else {
            return false;
        }
    } catch (error) {
        winston.info("Error en utility.isNumericValue,", error);
        return false;
    }
};

utility.convertSecondsInDaysHoursString = (secondsString) => {
    try {
        // '86400': cantidad de segundos de 1 dia = 24*60*60
        // '3600': cantidad de segundos de 1 hora
        const secondsBd = new bigDecimal(secondsString);
        const oneDayInSecondsBd = new bigDecimal('86400');
        const oneHourInSecondsBd = new bigDecimal('3600');
        let diasBd = secondsBd.divide(oneDayInSecondsBd, 0);
        let restoDiasBd = secondsBd.modulus(oneDayInSecondsBd);
        let horasBd = restoDiasBd.divide(oneHourInSecondsBd, 0);
        let diasStr = null;
        let horasStr = null;
        if (diasBd.compareTo(unoBd) == 0) {
            diasStr = " día";
        } else {
            diasStr = " días";
        }
        if (horasBd.compareTo(unoBd) == 0) {
            horasStr = " hora";
        } else {
            horasStr = " horas";
        }
        return diasBd.getValue() + diasStr + ", " + horasBd.getValue() + horasStr;
    } catch (error) {
        error.stack = "\nError en utility.convertSecondsInDaysHoursString, " + error.stack;
        throw error;
    }
};

module.exports = utility;