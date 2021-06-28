module.exports = class TipoAmpliacion {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.nombre = obj.nombre;
    }
}