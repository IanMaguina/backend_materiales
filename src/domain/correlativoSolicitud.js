module.exports = class CorrelativoSolicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.anio = obj.anio;
        this.correlativo = obj.correlativo;
    }
}