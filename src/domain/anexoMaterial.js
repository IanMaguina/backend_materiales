module.exports = class AnexoMaterial {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.id_material_solicitud = obj.id_material_solicitud;
        this.nombre = obj.nombre;
        this.ruta_anexo = obj.ruta_anexo;
        this.id_rol = obj.id_rol;
        this.url = obj.url;
        this.etiqueta = obj.etiqueta;
        this.rol = obj.rol;
        
    }
}