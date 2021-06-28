module.exports = class EstrategiaRolUsuario {
    constructor(obj){
        obj = obj || {};
        this.usuario = obj.usuario;
        this.estrategia_rol = obj.estrategia_rol;
        this.activo = obj.activo;
    }
}