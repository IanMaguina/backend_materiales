module.exports = class AnexoSolicitud {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.id_solicitud = obj.id_solicitud;
        this.ruta_anexo = obj.ruta_anexo;
        this.nombre = obj.nombre;
        this.id_rol = obj.id_rol;
        this.etiqueta = obj.etiqueta;
        this.rol = obj.rol;        
    }
}