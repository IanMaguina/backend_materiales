module.exports = class EscenarioNivel1 {
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.codigo = obj.codigo;
        this.nombre = obj.nombre;
        this.sociedad = obj.sociedad;
    }
}