module.exports = class EquivalenciaMaterial{
    constructor(obj){
        obj = obj || {};
        this.id = obj.id;
        this.id_material_solicitud = obj.id_material_solicitud;
        this.valor1 = obj.valor1;
        this.unidad_medida1 = obj.unidad_medida1;
        this.valor2 = obj.valor2;
        this.unidad_medida2 = obj.unidad_medida2;
        this.id_rol= obj.id_rol;
    }
}