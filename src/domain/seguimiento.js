module.exports = class Seguimiento {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.estadoSolicitud = obj.estadoSolicitud;
        this.solicitud = obj.solicitud;
        this.motivo = obj.motivo;
        this.usuario = obj.usuario;
        this.fecha_registro = obj.fecha_registro;
        this.rol = obj.rol;
    }
}