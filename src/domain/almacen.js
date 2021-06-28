module.exports = class Almacen{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.codigo_sap = obj.codigo_sap;
        this.id_centro = obj.id_centro;
        this.nombre = obj.nombre;
    }
}