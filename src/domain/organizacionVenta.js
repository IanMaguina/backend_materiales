module.exports = class OrganizacionVenta{
    constructor(obj){
        obj = obj || {};
        this.id_organizacion_ventas = obj.id_organizacion_ventas;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
    }
}