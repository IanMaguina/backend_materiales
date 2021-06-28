module.exports = class EscenarioNivel3 {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.codigo = obj.codigo;
        this.nombre = obj.nombre;
        this.escenario_nivel2 = obj.escenario_nivel2;
        this.tipo_material = obj.tipo_material;
    }
}