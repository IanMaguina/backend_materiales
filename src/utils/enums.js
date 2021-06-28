const CAMPO = {
 /*[1]*/ "ramo": { original: "ramo", borrador: "ramo", error: "ramo_error" },
/*[2]*/ "denominacion": { original: "denominacion", borrador: "denominacion", error: "denominacion_error" },
/*[3]*/ "unidad_medida_base": { original: "id_unidad_medida_base", borrador: "unidad_medida_base", error: "unidad_medida_base_error" },
/*[4]*/ "peso_bruto": { original: "peso_bruto", borrador: "peso_bruto", error: "peso_bruto_error" },
/*[5]*/ "unidad_medida_peso": { original: "id_unidad_medida_peso", borrador: "unidad_medida_peso", error: "unidad_medida_peso_error" },
/*[6]*/ "partida_arancelaria": { original: "partida_arancelaria", borrador: "partida_arancelaria", error: "partida_arancelaria_error" },
/*[7]*/ "centro_codigo_sap": { original: "centro_codigo_sap", borrador: "centro_codigo_sap", error: "centro_codigo_sap_error" },
/*[8]*/ "centro_beneficio_codigo_sap": { original: "centro_beneficio_codigo_sap", borrador: "centro_beneficio_codigo_sap", error: "centro_beneficio_codigo_sap_error" },
/*[9]*/ "almacen_codigo_sap": { original: "almacen_codigo_sap", borrador: "almacen_codigo_sap", error: "almacen_codigo_sap_error" },
/*[10]*/ "organizacion_ventas": { original: "organizacion_ventas", borrador: "organizacion_ventas", error: "organizacion_ventas_error" },
/*[11]*/ "canal_distribucion": { original: "canal_distribucion", borrador: "canal_distribucion", error: "canal_distribucion_error" },
/*[12]*/ "clasificacion_tab": { original: "id_clasificacion", borrador: "clasificacion_borrador", error: "error" },
/*[13]*/ "tipo_material": { original: "tipo_material", borrador: "tipo_material", error: "tipo_material_error" },
/*[14]*/ "grupo_articulo": { original: "grupo_articulo", borrador: "grupo_articulo", error: "grupo_articulo_error" },
/*[15]*/ "sector": { original: "sector", borrador: "sector", error: "sector_error" },
/*[16]*/ "grupo_tipo_posicion_gral": { original: "grupo_tipo_posicion_gral", borrador: "grupo_tipo_posicion_gral", error: "grupo_tipo_posicion_gral_error" },
/*[17]*/ "codigo_ean": { original: "codigo_ean", borrador: "codigo_ean", error: "codigo_ean_error" },
/*[18]*/ "tipo_ean": { original: "tipo_ean", borrador: "tipo_ean", error: "tipo_ean_error" },
/*[19]*/ "texto_compra": { original: "texto_compra", borrador: "texto_compra", error: "texto_compra_error" },
/*[20]*/ "link_adjunt": { original: "", borrador: "", error: "" },
/*[21]*/ "clasificacion_fiscal": { original: "clasificacion_fiscal", borrador: "clasificacion_fiscal", error: "clasificacion_fiscal_error" },
/*[22]*/ "unidad_medida_venta": { original: "id_unidad_medida_venta", borrador: "unidad_medida_venta", error: "unidad_medida_venta_error" },
/*[23]*/ "grupo_estadistica_mat": { original: "grupo_estadistica_mat", borrador: "grupo_estadistica_mat", error: "grupo_estadistica_mat_error" },
/*[24]*/ "grupo_tipo_posicion": { original: "grupo_tipo_posicion", borrador: "grupo_tipo_posicion", error: "grupo_tipo_posicion_error" },
/*[25]*/ "grupo_imputacion_material": { original: "grupo_imputacion_material", borrador: "grupo_imputacion_material", error: "grupo_imputacion_material_error" },
/*[26]*/ "jerarquia_producto": { original: "jerarquia_producto", borrador: "jerarquia_producto", error: "jerarquia_producto_error" },
/*[27]*/ "grupos_material1": { original: "grupo_material1", borrador: "grupo_material1", error: "grupo_material1_error" },
/*[28]*/ "grupos_material2": { original: "grupo_material2", borrador: "grupo_material2", error: "grupo_material2_error" },
/*[29]*/ "texto_comercial": { original: "texto_comercial", borrador: "texto_comercial", error: "texto_comercial_error" },
/*[30]*/ "verificacion_disponibilidad": { original: "verificacion_disponibilidad", borrador: "verificacion_disponibilidad", error: "verificacion_disponibilidad_error" },
/*[31]*/ "grupo_transporte": { original: "grupo_transporte", borrador: "grupo_transporte", error: "grupo_transporte_error" },
/*[32]*/ "grupo_carga": { original: "grupo_carga", borrador: "grupo_carga", error: "grupo_carga_error" },
/*[33]*/ "stock_negativo": { original: "stock_negativo", borrador: "stock_negativo", error: "stock_negativo_error" },
/*[34]*/ "formula_concreto": { original: "formula_concreto", borrador: "formula_concreto", error: "formula_concreto_error" },
/*[35]*/ "grupo_compra": { original: "grupo_compra", borrador: "grupo_compra", error: "grupo_compra_error" },
/*[36]*/ "unidad_medida_pedido": { original: "id_unidad_medida_pedido", borrador: "unidad_medida_pedido", error: "unidad_medida_pedido_error" },
/*[37]*/ "precio_estandar": { original: "precio_estandar", borrador: "precio_estandar", error: "precio_estandar_error" },
/*[38]*/ "precio_variable": { original: "precio_variable", borrador: "precio_variable", error: "precio_variable_error" },
/*[39]*/ "categoria_valoracion": { original: "categoria_valoracion", borrador: "categoria_valoracion", error: "categoria_valoracion_error" },
/*[40]*/ "control_precio": { original: "control_precio", borrador: "control_precio", error: "control_precio_error" },
/*[41]*/ "determinacion_precio": { original: "determinacion_precio", borrador: "determinacion_precio", error: "determinacion_precio_error" },
/*[42]*/ "unidad_medida_almacen": { original: "id_unidad_medida_almacen", borrador: "unidad_medida_almacen", error: "unidad_medida_almacen_error" },
/*[43]*/ "ubicacion": { original: "ubicacion", borrador: "ubicacion", error: "ubicacion_error" },
/*[44]*/ "dcto_pronto_pago": { original: "dcto_pronto_pago", borrador: "dcto_pronto_pago", error: "dcto_pronto_pago_error" },
/*[45]*/ "grupo_planif_necesidades": { original: "grupo_planif_necesidades", borrador: "grupo_planif_necesidades", error: "grupo_planif_necesidades_error" },
/*[46]*/ "tipo_mrp_caract_plani": { original: "tipo_mrp_caract_plani", borrador: "tipo_mrp_caract_plani", error: "tipo_mrp_caract_plani_error" },
/*[47]*/ "planif_necesidades": { original: "planif_necesidades", borrador: "planif_necesidades", error: "planif_necesidades_error" },
/*[48]*/ "calculo_tamano_lote": { original: "calculo_tamano_lote", borrador: "calculo_tamano_lote", error: "calculo_tamano_lote_error" },
/*[49]*/ "area_planificacion_tab": { original: "area_planificacion_tab", borrador: "area_planificacion_tab", error: "area_planificacion_tab_error" },
/*[50]*/ "grupo_planif_necesidades_tab": { original: "grupo_planif_necesidades_tab", borrador: "grupo_planif_necesidades_tab", error: "grupo_planif_necesidades_tab_error" },
/*[51]*/ "caracteristica_necesidad_tab": { original: "caracteristica_necesidad_tab", borrador: "caracteristica_necesidad_tab", error: "caracteristica_necesidad_tab_error" },
/*[52]*/ "punto_pedido_tab": { original: "punto_pedido_tab", borrador: "punto_pedido_tab", error: "punto_pedido_tab_error" },
/*[53]*/ "stock_alm_max_tab": { original: "stock_alm_max_tab", borrador: "stock_alm_max_tab", error: "stock_alm_max_tab_error" },
/*[54]*/ "planif_necesidades_tab": { original: "planif_necesidades_tab", borrador: "planif_necesidades_tab", error: "planif_necesidades_tab_error" },
/*[55]*/ "calculo_tamano_lote_tab": { original: "calculo_tamano_lote_tab", borrador: "calculo_tamano_lote_tab", error: "calculo_tamano_lote_tab_error" },
/*[56]*/ "valor_redondeo_tab": { original: "valor_redondeo_tab", borrador: "valor_redondeo_tab", error: "valor_redondeo_tab_error" },
/*[57]*/ "alm_aprov_ext_tab": { original: "alm_aprov_ext_tab", borrador: "alm_aprov_ext_tab", error: "alm_aprov_ext_tab_error" },
/*[58]*/ "plazo_entrega_prev_tab": { original: "plazo_entrega_prev_tab", borrador: "plazo_entrega_prev_tab", error: "plazo_entrega_prev_tab_error" },
/*[59]*/ "nivel_servicio_tab": { original: "nivel_servicio_tab", borrador: "nivel_servicio_tab", error: "nivel_servicio_tab_error" },
/*[60]*/ "stock_seguridad_tab": { original: "stock_seguridad_tab", borrador: "stock_seguridad_tab", error: "stock_seguridad_tab_error" },
/*[61]*/ "indicador_margen_seg_tab": { original: "indicador_margen_seg_tab", borrador: "indicador_margen_seg_tab", error: "indicador_margen_seg_tab_error" },
/*[62]*/ "margen_seguridad_tab": { original: "margen_seguridad_tab", borrador: "margen_seguridad_tab", error: "margen_seguridad_tab_error" },
/*[63]*/ "modelo_pronostico_tab": { original: "modelo_pronostico_tab", borrador: "modelo_pronostico_tab", error: "modelo_pronostico_tab_error" },
/*[64]*/ "periodo_pasado_tab": { original: "periodo_pasado_tab", borrador: "periodo_pasado_tab", error: "periodo_pasado_tab_error" },
/*[65]*/ "periodo_pronostico_tab": { original: "periodo_pronostico_tab", borrador: "periodo_pronostico_tab", error: "periodo_pronostico_tab_error" },
/*[66]*/ "periodo_estaci_tab": { original: "periodo_estaci_tab", borrador: "periodo_estaci_tab", error: "periodo_estaci_tab_error" },
/*[67]*/ "limite_alarma_tab": { original: "limite_alarma_tab", borrador: "limite_alarma_tab", error: "limite_alarma_tab_error" },
/*[68]*/ "clase_aprovis": { original: "clase_aprovis", borrador: "clase_aprovis", error: "clase_aprovis_error" },
/*[69]*/ "aprovis_especial": { original: "aprovis_especial", borrador: "aprovis_especial", error: "aprovis_especial_error" },
/*[70]*/ "toma_retrograda": { original: "toma_retrograda", borrador: "toma_retrograda", error: "toma_retrograda_error" },
/*[71]*/ "almacen_produccion": { original: "almacen_produccion", borrador: "almacen_produccion", error: "almacen_produccion_error" },
/*[72]*/ "alm_aprov_ext": { original: "alm_aprov_ext_pn2_almacen", borrador: "alm_aprov_ext_pn2_almacen", error: "alm_aprov_ext_pn2_almacen_error" },
/*[73]*/ "co_producto": { original: "co_producto", borrador: "co_producto", error: "co_producto_error" },
/*[74]*/ "tiempo_fab_propia_pn2": { original: "tiempo_fab_propia_pn2", borrador: "tiempo_fab_propia_pn2", error: "tiempo_fab_propia_pn2_error" },
/*[75]*/ "plaza_entrega_prev": { original: "plaza_entrega_prev", borrador: "plaza_entrega_prev", error: "plaza_entrega_prev_error" },
/*[76]*/ "clave_horizonte": { original: "clave_horizonte", borrador: "clave_horizonte", error: "clave_horizonte_error" },
/*[77]*/ "stock_seguridad_pn2": { original: "stock_seguridad_pn2", borrador: "stock_seguridad_pn2", error: "stock_seguridad_pn2_error" },
/*[78]*/ "stock_seguridad_min_pn2": { original: "stock_seguridad_min_pn2", borrador: "stock_seguridad_min_pn2", error: "stock_seguridad_min_pn2_error" },
/*[79]*/ "nivel_servicio_pn2": { original: "nivel_servicio_pn2", borrador: "nivel_servicio_pn2", error: "nivel_servicio_pn2_error" },
/*[80]*/ "indicador_periodo": { original: "indicador_periodo", borrador: "indicador_periodo", error: "indicador_periodo_error" },
/*[81]*/ "grupo_estrategia": { original: "grupo_estrategia", borrador: "grupo_estrategia", error: "grupo_estrategia_error" },
/*[82]*/ "planf_neces_mixtas": { original: "planf_neces_mixtas", borrador: "planf_neces_mixtas", error: "planf_neces_mixtas_error" },
/*[83]*/ "individual_colectivo": { original: "individual_colectivo", borrador: "individual_colectivo", error: "individual_colectivo_error" },
/*[84]*/ "rechazo_componente": { original: "rechazo_componente", borrador: "rechazo_componente", error: "rechazo_componente_error" },
/*[85]*/ "sujeto_lote": { original: "sujeto_lote", borrador: "sujeto_lote", error: "sujeto_lote_error" },
/*[86]*/ "responsable_control_produccion": { original: "id_responsable_control_produccion", borrador: "responsable_control_produccion", error: "responsable_control_produccion_error" },
/*[87]*/ "perfil_control_fabricacion": { original: "id_perfil_control_fabricacion", borrador: "perfil_control_fabricacion", error: "perfil_control_fabricacion_error" },
/*[88]*/ "unidad_medida_fabricacion": { original: "id_unidad_medida_fabricacion", borrador: "unidad_medida_fabricacion", error: "unidad_medida_fabricacion_error" },
/*[89]*/ "limite_exceso_sum_ilimitado": { original: "limite_exceso_sum_ilimitado", borrador: "limite_exceso_sum_ilimitado", error: "limite_exceso_sum_ilimitado_error" },
/*[91]*/ "modelo_pronostico": { original: "modelo_pronostico", borrador: "modelo_pronostico", error: "modelo_pronostico_error" },
/*[92]*/ "periodo_pasado": { original: "periodo_pasado", borrador: "periodo_pasado", error: "periodo_pasado_error" },
/*[93]*/ "periodo_pronostico": { original: "periodo_pronostico", borrador: "periodo_pronostico", error: "periodo_pronostico_error" },
/*[94]*/ "inicializacion": { original: "inicializacion", borrador: "inicializacion", error: "inicializacion_error" },
/*[95]*/ "limite_alarma": { original: "limite_alarma", borrador: "limite_alarma", error: "limite_alarma_error" },
/*[96]*/ "grado_optimizacion": { original: "grado_optimizacion", borrador: "grado_optimizacion", error: "grado_optimizacion_error" },
/*[97]*/ "proc_sel_modelo": { original: "proc_sel_modelo", borrador: "proc_sel_modelo", error: "proc_sel_modelo_error" },
/*[98]*/ "anular_autormaticamente": { original: "anular_autormaticamente", borrador: "anular_autormaticamente", error: "anular_autormaticamente_error" },
/*[99]*/ "optimizacion_parametros": { original: "optimizacion_parametros", borrador: "optimizacion_parametros", error: "optimizacion_parametros_error" },
/*[100]*/ "estructura_cuantica": { original: "estructura_cuantica", borrador: "estructura_cuantica", error: "estructura_cuantica_error" },
/*[101]*/ "origen_material": { original: "origen_material", borrador: "origen_material", error: "origen_material_error" },
/*[102]*/ "tamano_lote": { original: "tamano_lote", borrador: "tamano_lote", error: "tamano_lote_error" },
/*[107]*/ "clase_inspeccion_tab": { original: "id_clase_inspeccion", borrador: "clase_inspeccion_borrador", error: "clase_inspeccion_tab_error" },
/*[108]*/ "criticos": { original: "criticos", borrador: "criticos", error: "criticos_error" },
/*[109]*/ "estrategicos": { original: "estrategicos", borrador: "estrategicos", error: "estrategicos_error" },
/*[110]*/ "ump_var": { original: "ump_var", borrador: "ump_var", error: "ump_var_error" },
/*[111]*/ "cantidad_base": { original: "cantidad_base", borrador: "cantidad_base", error: "cantidad_base_error" },
/*[112]*/ "idioma": { original: "idioma", borrador: "idioma", error: "idioma_error" },
/*[113]*/ "ampliacion": { original: "ampliacion", borrador: "ampliacion", error: "ampliacion_error" },
/*[114]*/ "precio_base": { original: "precio_base", borrador: "precio_base", error: "precio_base_error" },
/*[115]*/ "moneda": { original: "moneda", borrador: "moneda", error: "moneda_error" },
/*[116]*/ "ind_ped_automa": { original: "ind_ped_automa", borrador: "ind_ped_automa", error: "ind_ped_automa_error" },
/*[117]*/ "exceso_sum_ilimitado": { original: "exceso_sum_ilimitado", borrador: "exceso_sum_ilimitado", error: "exceso_sum_ilimitado_error" },
/*[200]*/ "material_codigo_sap": { original: "material_codigo_sap", borrador: "material_codigo_sap", error: "material_codigo_sap_error" },
    "material_codigo_modelo": { original: "material_codigo_modelo", borrador: "material_codigo_modelo", error: "material_codigo_modelo_error" }
};

const ESCENARIO_NIVEL_1 = {
    "1000": { urlControlador: "productosTerminados" },
    "2000": { urlControlador: "productosTerminados" },
    "3000": { urlControlador: "productosTerminados" },
    "4000": { urlControlador: "productosTerminados" }
};

class TipoTabla {
    constructor() {
        this.original = 1;
        this.borrador = 2;
    }
}

class CampoCodigoInternoEnum {
    constructor() {
        this.material_codigo_modelo = 'material_codigo_modelo'
        this.ramo = "ramo";// 1
        this.denominacion = "denominacion";// 2
        this.unidad_medida_base = "unidad_medida_base";// 3
        this.peso_bruto = "peso_bruto";// 4
        this.unidad_medida_peso = "unidad_medida_peso";// 5
        this.partida_arancelaria = "partida_arancelaria";// 6
        this.centro_codigo_sap = "centro_codigo_sap";// 7
        this.centro_beneficio_codigo_sap = "centro_beneficio_codigo_sap";// 8
        this.almacen_codigo_sap = "almacen_codigo_sap";// 9
        this.organizacion_ventas = "organizacion_ventas";// 10
        this.canal_distribucion = "canal_distribucion";// 11
        this.clasificacion_tab = "clasificacion_tab";// 12 
        this.tipo_material = "tipo_material";// 13
        this.grupo_articulo = "grupo_articulo";// 14        
        this.sector = "sector";// 15
        this.grupo_tipo_posicion_gral = "grupo_tipo_posicion_gral";// 16
        this.codigo_ean = "codigo_ean";// 17
        this.tipo_ean = "tipo_ean";// 18
        this.texto_compra = "texto_compra";// 19
        this.link_adjunt = "link_adjunt";// 20 - por revisar tabla anexo material
        this.clasificacion_fiscal = "clasificacion_fiscal";// 21
        this.unidad_medida_venta = "unidad_medida_venta";// 22
        this.grupo_estadistica_mat = "grupo_estadistica_mat";// 23
        this.grupo_tipo_posicion = "grupo_tipo_posicion";// 24
        this.grupo_imputacion_material = "grupo_imputacion_material";// 25
        this.jerarquia_producto = "jerarquia_producto";// 26
        this.grupo_material1 = "grupos_material1";// 27
        this.grupo_material2 = "grupos_material2";// 28
        this.texto_comercial = "texto_comercial";// 29
        this.verificacion_disponibilidad = "verificacion_disponibilidad";// 30
        this.grupo_transporte = "grupo_transporte";// 31
        this.grupo_carga = "grupo_carga";// 32
        this.stock_negativo = "stock_negativo";// 33
        this.formula_concreto = "formula_concreto";// 34        
        this.grupo_compra = "grupo_compra";// 35
        this.unidad_medida_pedido = "unidad_medida_pedido";// 36
        this.precio_estandar = "precio_estandar";// 37
        this.precio_variable = "precio_variable";// 38
        this.categoria_valoracion = "categoria_valoracion";// 39        
        this.control_precio = "control_precio";// 40
        this.determinacion_precio = "determinacion_precio";// 41
        this.unidad_medida_almacen = "unidad_medida_almacen";// 42
        this.ubicacion = "ubicacion";// 43
        this.dcto_pronto_pago = "dcto_pronto_pago";// 44           
        this.grupo_planif_necesidades = "grupo_planif_necesidades";// 45
        this.tipo_mrp_caract_plani = "tipo_mrp_caract_plani";// 46
        this.planif_necesidades = "planif_necesidades";// 47
        this.calculo_tamano_lote = "calculo_tamano_lote";// 48
        this.area_planificacion_tab = "area_planificacion_tab";// 49
        this.grupo_planif_necesidades_tab = "grupo_planif_necesidades_tab";// 50
        this.caracteristica_necesidad_tab = "caracteristica_necesidad_tab";// 51
        this.punto_pedido_tab = "punto_pedido_tab";// 52
        this.stock_alm_max_tab = "stock_alm_max_tab";// 53   
        this.planif_necesidades_tab = "planif_necesidades_tab";// 54
        this.calculo_tamano_lote_tab = "calculo_tamano_lote_tab";// 55   
        this.valor_redondeo_tab = "valor_redondeo_tab";// 56
        this.alm_aprov_ext_tab = "alm_aprov_ext_tab";// 57
        this.plazo_entrega_prev_tab = "plazo_entrega_prev_tab";// 58 
        this.nivel_servicio_tab = "nivel_servicio_tab";// 59
        this.stock_seguridad_tab = "stock_seguridad_tab";// 60
        this.indicador_margen_seg_tab = "indicador_margen_seg_tab";// 61
        this.margen_seguridad_tab = "margen_seguridad_tab";// 62
        this.modelo_pronostico_tab = "modelo_pronostico_tab";// 63
        this.periodo_pasado_tab = "periodo_pasado_tab";// 64
        this.periodo_pronostico_tab = "periodo_pronostico_tab";// 65
        this.periodo_estaci_tab = "periodo_estaci_tab";// 66
        this.limite_alarma_tab = "limite_alarma_tab";// 67
        this.clase_aprovis = "clase_aprovis";// 68
        this.aprovis_especial = "aprovis_especial";// 69
        this.toma_retrograda = "toma_retrograda";// 70
        this.almacen_produccion = "almacen_produccion";// 71
        this.alm_aprov_ext = "alm_aprov_ext";// 72 - por revisar pm2 
        this.co_producto = "co_producto";// 73
        this.tiempo_fab_propia_pn2 = "tiempo_fab_propia_pn2";// 74
        this.plaza_entrega_prev = "plaza_entrega_prev";// 75
        this.clave_horizonte = "clave_horizonte";// 76
        this.stock_seguridad_pn2 = "stock_seguridad_pn2";// 77
        this.stock_seguridad_min_pn2 = "stock_seguridad_min_pn2";// 78
        this.nivel_servicio_pn2 = "nivel_servicio_pn2";// 79
        this.indicador_periodo = "indicador_periodo";// 80
        this.grupo_estrategia = "grupo_estrategia";// 81
        this.planf_neces_mixtas = "planf_neces_mixtas"; //82
        this.individual_colectivo = "individual_colectivo";// 83
        this.rechazo_componente = "rechazo_componente";// 84
        this.sujeto_lote = "sujeto_lote";// 85
        this.responsable_control_produccion = "responsable_control_produccion";// 86
        this.perfil_control_fabricacion = "perfil_control_fabricacion";// 87
        this.unidad_medida_fabricacion = "unidad_medida_fabricacion";// 88
        /*[89]*/ this.limite_exceso_sum_ilimitado = "limite_exceso_sum_ilimitado";
        /*[90]*/
        this.modelo_pronostico = "modelo_pronostico";// 91
        this.periodo_pasado = "periodo_pasado";// 92
        this.periodo_pronostico = "periodo_pronostico";// 93
        this.inicializacion = "inicializacion";// 94
        this.limite_alarma = "limite_alarma";// 95
        this.grado_optimizacion = "grado_optimizacion";// 96
        this.proc_sel_modelo = "proc_sel_modelo";// 97
        this.anular_automaticamente = "anular_automaticamente";// 98
        this.optimizacion_parametro = "optimizacion_parametro";// 99
        this.estructura_cuantica = "estructura_cuantica";// 100
        this.origen_material = "origen_material";// 101
        this.tamano_lote = "tamano_lote";// 102
        // no existe campo 103
        // no existe campo 104
        // no existe campo 105
        // no existe campo 106
        this.clase_inspeccion_tab = "clase_inspeccion_tab";// 107
        this.criticos = "criticos";// 108
        this.estrategicos = "estrategicos";// 109
        this.ump_var = "ump_var";// 110 
        this.cantidad_base = "cantidad_base";// 111
        this.idioma = "idioma";// 112
        this.ampliacion = "ampliacion";// 113
        /*[114]*/ this.precio_base = "precio_base";
        /*[115]*/ this.moneda = "moneda";
        /*[116]*/ this.ind_ped_automa = "ind_ped_automa";
        /*[117]*/ this.exceso_sum_ilimitado = "exceso_sum_ilimitado";
        /*[200]*/ this.material_codigo_sap = "material_codigo_sap";
    }
}

class ColumnasMaterialSolicitudEnum {
    constructor() {
        this.ramo = "ramo";
        this.denominacion = "denominacion";
        this.id_unidad_medida_base = "id_unidad_medida_base";
        this.peso_bruto = "peso_bruto";
        this.id_unidad_medida_peso = "id_unidad_medida_peso";
        this.partida_arancelaria = "partida_arancelaria";
        this.centro_codigo_sap = "centro_codigo_sap";
        this.centro_beneficio_codigo_sap = "centro_beneficio_codigo_sap";
        this.almacen_codigo_sap = "almacen_codigo_sap";
        this.organizacion_ventas = "organizacion_ventas";
        this.canal_distribucion = "canal_distribucion";
        this.tipo_material = "tipo_material";
        this.grupo_articulo = "grupo_articulo";
        this.sector = "sector";
        this.grupo_tipo_posicion_gral = "grupo_tipo_posicion_gral";
        this.codigo_ean = "codigo_ean";
        this.tipo_ean = "tipo_ean";
        this.texto_compra = "texto_compra";
        this.clasificacion_fiscal = "clasificacion_fiscal";
        this.id_unidad_medida_venta = "id_unidad_medida_venta";
        this.grupo_estadistica_mat = "grupo_estadistica_mat";
        this.grupo_tipo_posicion = "grupo_tipo_posicion";
        this.grupo_imputacion_material = "grupo_imputacion_material";
        this.jerarquia_producto = "jerarquia_producto";
        this.grupo_material1 = "grupo_material1";
        this.grupo_material2 = "grupo_material2";
        this.texto_comercial = "texto_comercial";
        //this.id_verificacion_disponibilidad = "id_verificacion_disponibilidad";
        this.verificacion_disponibilidad = "verificacion_disponibilidad";
        //this.id_grupo_transporte = "id_grupo_transporte";
        this.grupo_transporte = "grupo_transporte";
        //this.id_grupo_carga = "id_grupo_carga";
        this.grupo_carga = "grupo_carga";
        this.stock_negativo = "stock_negativo";
        this.formula_concreto = "formula_concreto";
        this.grupo_compra = "grupo_compra";
        this.id_unidad_medida_pedido = "id_unidad_medida_pedido";
        this.precio_estandar = "precio_estandar";
        this.precio_variable = "precio_variable";
        this.categoria_valoracion = "categoria_valoracion";
        this.control_precio = "control_precio";
        this.determinacion_precio = "determinacion_precio";
        this.id_unidad_medida_almacen = "id_unidad_medida_almacen";
        this.ubicacion = "ubicacion";
        this.dcto_pronto_pago = "dcto_pronto_pago";
        this.grupo_planif_necesidades = "grupo_planif_necesidades";
        //this.id_tipo_mrp_caract_plani = "id_tipo_mrp_caract_plani";
        this.tipo_mrp_caract_plani = "tipo_mrp_caract_plani";
        this.planif_necesidades = "planif_necesidades";
        //this.id_calculo_tamano_lote = "id_calculo_tamano_lote";
        this.calculo_tamano_lote = "calculo_tamano_lote";
        //this.id_clase_aprovis = "id_clase_aprovis";
        this.clase_aprovis = "clase_aprovis";
        this.aprovis_especial = "aprovis_especial";
        this.toma_retrograda = "toma_retrograda";
        this.almacen_produccion = "almacen_produccion";
        this.co_producto = "co_producto";
        this.tiempo_fab_propia_pn2 = "tiempo_fab_propia_pn2";
        this.plaza_entrega_prev = "plaza_entrega_prev";
        this.clave_horizonte = "clave_horizonte";
        this.stock_seguridad_pn2 = "stock_seguridad_pn2";
        this.stock_seguridad_min_pn2 = "stock_seguridad_min_pn2";
        this.nivel_servicio_pn2 = "nivel_servicio_pn2";
        //this.id_indicador_periodo = "id_indicador_periodo";
        this.indicador_periodo = "indicador_periodo";
        //this.id_grupo_estrategia = "id_grupo_estrategia";
        this.grupo_estrategia = "grupo_estrategia";
        //this.id_planf_neces_mixtas = "id_planf_neces_mixtas";
        this.planf_neces_mixtas = "planf_neces_mixtas";
        //this.id_individual_colectivo = "id_individual_colectivo";
        this.individual_colectivo = "individual_colectivo";
        this.rechazo_componente = "rechazo_componente";
        this.sujeto_lote = "sujeto_lote";
        this.id_responsable_control_produccion = "id_responsable_control_produccion";
        this.id_perfil_control_fabricacion = "id_perfil_control_fabricacion";
        this.id_unidad_medida_fabricacion = "id_unidad_medida_fabricacion";
        this.limite_exceso_sum_ilimitado = "limite_exceso_sum_ilimitado";
        this.modelo_pronostico = "modelo_pronostico";
        this.periodo_pasado = "periodo_pasado";
        this.periodo_pronostico = "periodo_pronostico";
        //this.id_inicializacion = "id_inicializacion";
        this.inicializacion = "inicializacion";
        this.limite_alarma = "limite_alarma";
        //this.id_grado_optimizacion = "id_grado_optimizacion";
        this.grado_optimizacion = "grado_optimizacion";
        //this.id_proc_sel_modelo = "id_proc_sel_modelo";
        this.proc_sel_modelo = "proc_sel_modelo";
        this.anular_automaticamente = "anular_automaticamente";
        this.optimizacion_parametro = "optimizacion_parametro";
        this.estructura_cuantica = "estructura_cuantica";
        this.origen_material = "origen_material";
        this.tamano_lote = "tamano_lote";
        this.criticos = "criticos";
        this.estrategicos = "estrategicos";
        this.ump_var = "ump_var";
        this.cantidad_base = "cantidad_base";
        this.idioma = "idioma";
        this.ampliacion = "ampliacion";
        this.precio_base = "precio_base";
        this.moneda = "moneda";
        this.ind_ped_automa = "ind_ped_automa";
        this.exceso_sum_ilimitado = "exceso_sum_ilimitado";
        this.material_codigo_sap = "material_codigo_sap";

        this.id_solicitud = "id_solicitud";
        this.material_codigo_modelo = "material_codigo_modelo";
        this.alm_aprov_ext_pn2_almacen = "alm_aprov_ext_pn2_almacen";
        this.alm_aprov_ext_pn2_centro = "alm_aprov_ext_pn2_centro";
        this.almacen_produccion_centro = "almacen_produccion_centro";
    }
}

class ColumnasMaterialSolicitudBorradorEnum {
    constructor() {
        this.id_material_solicitud = "id_material_solicitud";
        this.id_solicitud = "id_solicitud";
        this.material_codigo_modelo = "material_codigo_modelo";
        this.material_codigo_sap = "material_codigo_sap";
        this.ampliacion = "ampliacion";
        this.peso_bruto = "peso_bruto";
        this.unidad_medida_base = "unidad_medida_base";
        this.denominacion = "denominacion";
        this.tipo_material = "tipo_material";
        this.ramo = "ramo";
        this.grupo_articulo = "grupo_articulo";
        this.partida_arancelaria = "partida_arancelaria";
        this.organizacion_ventas = "organizacion_ventas";
        this.canal_distribucion = "canal_distribucion";
        this.grupo_tipo_posicion = "grupo_tipo_posicion";
        this.grupo_material1 = "grupo_material1";
        this.grupo_material2 = "grupo_material2";
        this.verificacion_disponibilidad = "verificacion_disponibilidad";
        this.grupo_transporte = "grupo_transporte";
        this.grupo_carga = "grupo_carga";
        this.unidad_medida_peso = "unidad_medida_peso";
        this.sector = "sector";
        this.grupo_tipo_posicion_gral = "grupo_tipo_posicion_gral";
        this.formula_concreto = "formula_concreto";
        this.codigo_ean = "codigo_ean";
        this.tipo_ean = "tipo_ean";
        this.clasificacion_fiscal = "clasificacion_fiscal";
        this.dcto_pronto_pago = "dcto_pronto_pago";
        this.unidad_medida_venta = "unidad_medida_venta";
        this.grupo_estadistica_mat = "grupo_estadistica_mat";
        this.stock_negativo = "stock_negativo";
        this.grupo_compra = "grupo_compra";
        this.unidad_medida_pedido = "unidad_medida_pedido";
        this.precio_estandar = "precio_estandar";
        this.precio_variable = "precio_variable";
        this.control_precio = "control_precio";
        this.determinacion_precio = "determinacion_precio";
        this.unidad_medida_almacen = "unidad_medida_almacen";
        this.tipo_mrp_caract_plani = "tipo_mrp_caract_plani";
        this.calculo_tamano_lote = "calculo_tamano_lote";
        this.clase_aprovis = "clase_aprovis";
        this.toma_retrograda = "toma_retrograda";
        this.co_producto = "co_producto";
        this.tiempo_fab_propia_pn2 = "tiempo_fab_propia_pn2";
        this.plaza_entrega_prev = "plaza_entrega_prev";
        this.stock_seguridad_pn2 = "stock_seguridad_pn2";
        this.stock_seguridad_min_pn2 = "stock_seguridad_min_pn2";
        this.nivel_servicio_pn2 = "nivel_servicio_pn2";
        this.indicador_periodo = "indicador_periodo";
        this.grupo_estrategia = "grupo_estrategia";
        this.planf_neces_mixtas = "planf_neces_mixtas";
        this.individual_colectivo = "individual_colectivo";
        this.rechazo_componente = "rechazo_componente";
        this.sujeto_lote = "sujeto_lote";
        this.unidad_medida_fabricacion = "unidad_medida_fabricacion";
        /*[89]*/ this.limite_exceso_sum_ilimitado = "limite_exceso_sum_ilimitado";
        /*[90]*/
        this.modelo_pronostico = "modelo_pronostico";
        this.periodo_pasado = "periodo_pasado";
        this.periodo_pronostico = "periodo_pronostico";
        this.inicializacion = "inicializacion";
        this.limite_alarma = "limite_alarma";
        this.grado_optimizacion = "grado_optimizacion";
        this.proc_sel_modelo = "proc_sel_modelo";
        this.anular_automaticamente = "anular_automaticamente";
        this.optimizacion_parametro = "optimizacion_parametro";
        this.estructura_cuantica = "estructura_cuantica";
        this.origen_material = "origen_material";
        this.tamano_lote = "tamano_lote";
        this.criticos = "criticos";
        this.estrategicos = "estrategicos";
        this.almacen_codigo_sap = "almacen_codigo_sap";
        this.centro_codigo_sap = "centro_codigo_sap";
        this.centro_beneficio_codigo_sap = "centro_beneficio_codigo_sap";
        this.grupo_planif_necesidades = "grupo_planif_necesidades";
        this.alm_aprov_ext_pn2_almacen = "alm_aprov_ext_pn2_almacen";
        this.alm_aprov_ext_pn2_centro = "alm_aprov_ext_pn2_centro";
        this.almacen_produccion = "almacen_produccion";
        this.almacen_produccion_centro = "almacen_produccion_centro";
        this.planif_necesidades = "planif_necesidades";
        this.aprovis_especial = "aprovis_especial";
        this.clave_horizonte = "clave_horizonte";
        this.responsable_control_produccion = "responsable_control_produccion";
        this.perfil_control_fabricacion = "perfil_control_fabricacion";
        this.categoria_valoracion = "categoria_valoracion";
        this.grupo_imputacion_material = "grupo_imputacion_material";
        this.jerarquia_producto = "jerarquia_producto";
        this.ump_var = "ump_var";
        this.idioma = "idioma";
        this.ubicacion = "ubicacion";
        this.texto_comercial = "texto_comercial";
        this.texto_compra = "texto_compra";
        this.cantidad_base = "cantidad_base";
        /*[114]*/ this.precio_base = "precio_base";
        /*[115]*/ this.moneda = "moneda";
        /*[116]*/ this.ind_ped_automa = "ind_ped_automa";
        /*[117]*/ this.exceso_sum_ilimitado = "exceso_sum_ilimitado";
    }
}

class TipoCarga {
    constructor() {
        this.individual = "individual";
        this.masivo = "masivo";
    }
}

class TipoOperacion {
    constructor() {
        this.insertar = "insertar";
        this.actualizar = "actualizar";
        this.ambos = "ambos";
    }
}

class VistaPortal {
    constructor() {
        this.basicos = 1;
        this.clasificacion = 2;
        this.comercio_ext = 3;
        this.ventas = 4;
        this.compras = 5;
        this.almacen = 6;
        this.contabilidad = 7;
        this.planif_necesi = 8;
        this.gest_calidad = 9;
        this.cal_coste = 10;
        this.pronostico = 11;
        this.prep_de_trabajo = 12;
        this.stock_centro = 13;
        this.area_planificacion = 0;//aun no hay codigo
    }
}

class Enums {
    constructor() {
        this.campoCodigoInterno = new CampoCodigoInternoEnum();
        this.columnasMaterialSolicitud = new ColumnasMaterialSolicitudEnum();
        this.columnasMaterialSolicitudBorrador = new ColumnasMaterialSolicitudBorradorEnum();
        this.tipoCarga = new TipoCarga();
        this.tipoOperacion = new TipoOperacion();

        this.tipo_tabla = new TipoTabla();
        this.codigo_interno = new CampoCodigoInternoEnum();
        this.columna = CAMPO;
        this.vista_portal = new VistaPortal();
        this.escenarioNivel1 = ESCENARIO_NIVEL_1;
    }
}


module.exports = new Enums();