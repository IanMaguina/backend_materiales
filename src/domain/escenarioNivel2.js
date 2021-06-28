module.exports = class EscenarioNivel2 {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.codigo = obj.codigo;
        this.nombre = obj.nombre;
        this.escenario_nivel1 = obj.escenario_nivel1;
    }
}