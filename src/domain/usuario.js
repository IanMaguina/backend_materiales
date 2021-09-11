module.exports = class Usuario {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.usuario = obj.usuario;
        this.rol = obj.rol;
        this.nombre = obj.nombre;
        this.area_usuario = obj.area_usuario;
        this.perfil_usuario = obj.perfil_usuario;
        this.activo = obj.activo;
    }
}