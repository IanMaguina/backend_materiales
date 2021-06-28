module.exports = class EstadoSolicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.nombre = obj.nombre;
        this.rol = obj.rol;
    }
}