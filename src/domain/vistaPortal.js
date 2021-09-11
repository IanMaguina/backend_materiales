module.exports = class VistaPortal{
    constructor(obj){
        obj = obj || {};
        this.id_vista_portal = obj.id_vista_portal;
        this.nombre = obj.nombre;
        this.regla_vista = obj.regla_vista;
        this.orden = obj.orden;
        this.campos = []        
    }    
}