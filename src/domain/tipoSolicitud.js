module.exports = class TipoSolicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.nombre = obj.nombre;
    }
}