module.exports = class Almacen{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.correo = obj.correo;
        this.nombre = obj.nombre;
        this.id_estrategia = obj.id_estrategia;
    }
}