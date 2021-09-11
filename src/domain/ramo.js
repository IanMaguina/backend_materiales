module.exports = class Ramo{
    constructor(obj){
        obj = obj || {};
        this.id_ramo = obj.id_ramo;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
    }
}