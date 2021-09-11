module.exports = class Clasificacion{
    constructor(obj){
        obj = obj || {};
        this.id_clasificacion = obj.id_clasificacion;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
    }
}