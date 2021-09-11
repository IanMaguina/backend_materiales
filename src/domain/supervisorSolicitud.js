module.exports = class SupervisorSolicitud {
    constructor(obj){
        obj = obj || {};
        this.solicitud = obj.solicitud;
        this.estado_aprobacion = obj.estado_aprobacion;
        this.usuarioSupervisor = obj.usuarioSupervisor;
        this.activo = obj.activo;
    }
}