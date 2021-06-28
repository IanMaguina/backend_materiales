module.exports = class MaterialSolicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.material_codigo_sap = obj.material_codigo_sap;
        this.mensaje_error_sap = obj.mensaje_error_sap;
    }
}