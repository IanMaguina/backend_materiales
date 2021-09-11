module.exports = class Campo{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.nombre = obj.nombre;
        this.regla_campo = obj.regla_campo;
        this.orden = obj.orden;
        this.tipo_objeto = obj.tipo_objeto;
        this.valor_defecto = obj.valor_defecto;
        this.tabla_maestra = obj.tabla_maestra;
        this.tipo_dato = obj.tipo_dato;
        this.longitud = obj.longitud;
        this.longitud_decimal = obj.longitud_decimal;
        this.etiqueta = obj.etiqueta;
        this.codigo_interno = obj.codigo_interno;
    }
}