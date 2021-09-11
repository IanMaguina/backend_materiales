module.exports = class Estrategia {
    constructor(obj){
        obj = obj || { id: null, escenario_nivel3: null, tipo_solicitud: null, usuario_enviar_correo: null };
        this.id = obj.id;
        this.escenario_nivel3 = obj.escenario_nivel3;
        this.tipo_solicitud = obj.tipo_solicitud;
        this.usuario_enviar_correo = obj.usuario_enviar_correo;
        this.tiene_roles = obj.tiene_roles;
    }
}