module.exports = class AreaUsuario {
    constructor(obj){
        obj = obj || { id: null, nombre: null };
        this.id = obj.id;
        this.nombre = obj.nombre;
    }
}