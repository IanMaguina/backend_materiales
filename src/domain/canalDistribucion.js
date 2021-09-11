module.exports = class CanalDistribucion{
    constructor(obj){
        obj = obj || {};
        this.id_canal_distribucion = obj.id_canal_distribucion;
        this.codigo_sap = obj.codigo_sap;
        this.nombre = obj.nombre;
    }
}