module.exports = class EstrategiaRol {
    constructor(obj){
        obj = obj || { id: null, orden: null, rol:null, estrategia: null, activo: null };
        this.id = obj.id;
        this.orden = obj.orden;
        this.rol = obj.rol;
        this.estrategia = obj.estrategia;
        this.activo = obj.activo;
    }
}