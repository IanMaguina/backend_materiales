module.exports = class UnidadMedida{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
    }    
}