module.exports = class Centro{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
        this.codigo_centro_beneficio = obj.codigo_centro_beneficio;
        this.codigo_sociedad = obj.codigo_sociedad;
    }
}