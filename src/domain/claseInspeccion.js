module.exports = class ClaseInspeccion{
    constructor(obj){
        obj = obj || {};
        this.id_clase_inspeccion = obj.id_clase_inspeccion;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
    }
}