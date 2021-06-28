module.exports = class AprobadorSolicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.solicitud = obj.solicitud;
        this.orden = obj.orden;
        this.id_usuario_aprobador = obj.id_usuario_aprobador;
        this.nombre_usuario_aprobador = obj.nombre_usuario_aprobador;
        this.correo_usuario = obj.correo_usuario
        this.id_rol = obj.id_rol;
        this.nombre_rol = obj.nombre_rol;
        this.aprobar_enviar_correo = obj.aprobar_enviar_correo;
        this.rechazar_enviar_correo = obj.rechazar_enviar_correo;
        this.esta_aqui = obj.esta_aqui;

        this.id_estado = obj.id_estado;// estado de la solicitud
        this.nombre_estado = obj.nombre_estado; // nombre de estado de la solicitud
        this.id_estado_real = obj.id_estado_real;
        this.nombre_estado_real = obj.nombre_estado_real;
        this.id_rol_real = obj.id_rol_real;
        this.nombre_rol_real = obj.nombre_rol_real;
        this.id_usuario_real = obj.id_usuario_real;
        this.nombre_usuario_real = obj.nombre_usuario_real;
        this.correo_usuario_real = obj.correo_usuario_real;
        this.fecha_ingreso = obj.fecha_ingreso;
        this.fecha_salida = obj.fecha_salida;
        this.tipo = obj.tipo;
        this.estado_completado = obj.estado_completado;
        this.motivo = obj.motivo;
        this.duracion = obj.duracion;
        this.id_motivo_rechazo = obj.id_motivo_rechazo;
        this.nombre_motivo_rechazo = obj.nombre_motivo_rechazo;
    }
}