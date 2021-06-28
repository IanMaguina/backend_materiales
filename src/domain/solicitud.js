module.exports = class Solicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.creado_por = obj.creado_por;
        this.fecha_creacion = obj.fecha_creacion;
        this.modificado_por = obj.modificado_por;
        this.fecha_modificacion = obj.fecha_modificacion;
        this.estadoSolicitud = obj.estadoSolicitud;
        this.justificacion_creacion = obj.justificacion_creacion;
        this.descripcion = obj.descripcion;
        this.tipoAmpliacion = obj.tipoAmpliacion;
        this.motivoRechazoObj = obj.motivoRechazoObj;
        this.motivo_rechazo = obj.motivo_rechazo;
        this.correlativo = obj.correlativo;
        this.escenarioNivel3 = obj.escenarioNivel3;
        this.tipoSolicitud = obj.tipoSolicitud;

        // campos que no existen con este nombre en la base de datos
        this.descripcion_corta = obj.descripcion_corta;
        this.cantidad_materiales = obj.cantidad_materiales;
    }
}