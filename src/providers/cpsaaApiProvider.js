const fetch = require("node-fetch");
const config = require('../config');
const constantes = require("../utils/constantes");
const enums = require("../utils/enums");
const utility = require("../utils/utility");
const service = {};

service.registrarMaterial = async (solicitud, list_regla_vista) => {
    var host = config.cpsaaSapApi.hostRegistrar;
    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(obtenerRegistroMaterialRequest(solicitud, list_regla_vista)),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [' + solicitud.id.toString() + '] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + solicitud.id.toString() + '] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + solicitud.id.toString() + '] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error registrando materiales en SAP', lista: [] };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            result.codigo = 1;
            result.mensaje = data.mensaje;
        }
    }

    return result;
};

service.consultarNombreMaterial = async (denominaciones) => {
    console.log('cpsaaApiProvider.consultarNombreMaterial');

    let req = { iconst: "", tentrada: [] };
    let counter = 1;
    denominaciones.forEach(denominacion => {
        req.tentrada.push({ ITEM_COD: counter.toString().padStart(3, '0'), MAKTX: denominacion });
        counter++;
    });

    var host = config.cpsaaSapApi.hostConsultaMaterialNombre;
    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [consulta_nombre] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_nombre] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_nombre] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por nombre desde SAP', lista: [] };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                data.resultado.TI_MAKT.forEach(element => {
                    result.lista.push({ material_codigo_sap: element.MATNR, denominacion: element.MAKTX })
                });
            }
        }
    }

    return result;
};

service.consultarCodigoMaterial = async (material) => {
    console.log('cpsaaApiProvider.consultarCodigoMaterial');

    let req = { consulta: { I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "", TI_ENTRADA: [{ "MATNR": material.codigo }] } };

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [' + material.codigo + '] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.codigo + '] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.codigo + '] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', lista: [] };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];

                    result.lista.push({ codigo_interno: "ramo", valor: element.MBRSH });
                    result.lista.push({ codigo_interno: "denominacion", valor: element.MAKTX });
                    result.lista.push({ codigo_interno: "unidad_medida_base", valor: element.MEINS });
                    result.lista.push({ codigo_interno: "peso_bruto", valor: element.BRGEW });
                    result.lista.push({ codigo_interno: "unidad_medida_peso", valor: element.GEWEI });
                    result.lista.push({ codigo_interno: "centro_codigo_sap", valor: element.WERKS });
                    result.lista.push({ codigo_interno: "centro_beneficio_codigo_sap", valor: element.PRCTR });
                    result.lista.push({ codigo_interno: "almacen_codigo_sap", valor: element.LGORT });
                    result.lista.push({ codigo_interno: "organizacion_ventas", valor: element.VKORG });
                    result.lista.push({ codigo_interno: "canal_distribucion", valor: element.VTWEG });
                    result.lista.push({ codigo_interno: "tipo_material", valor: element.MTART });
                    result.lista.push({ codigo_interno: "grupo_articulo", valor: element.MATKL });
                    result.lista.push({ codigo_interno: "sector", valor: element.SPART });
                    result.lista.push({ codigo_interno: "grupo_tipo_posicion_gral", valor: element.MTPOS });
                    result.lista.push({ codigo_interno: "codigo_ean", valor: element.EAN11 });
                    result.lista.push({ codigo_interno: "unidad_medida_venta", valor: element.VRKME });
                    result.lista.push({ codigo_interno: "grupo_estadistica_mat", valor: element.VERSG });
                    result.lista.push({ codigo_interno: "grupo_tipo_posicion", valor: element.MTPOSV });
                    result.lista.push({ codigo_interno: "grupo_imputacion_material", valor: element.KTGRM });
                    result.lista.push({ codigo_interno: "jerarquia_producto", valor: element.PRODH });
                    result.lista.push({ codigo_interno: "grupos_material1", valor: element.MVGR1 });
                    result.lista.push({ codigo_interno: "grupos_material2", valor: element.MVGR2, });
                    result.lista.push({ codigo_interno: "verificacion_disponibilidad", valor: element.MTVFP });
                    result.lista.push({ codigo_interno: "grupo_transporte", valor: element.TRAGR });
                    result.lista.push({ codigo_interno: "grupo_carga", valor: element.LADGR });
                    result.lista.push({ codigo_interno: "stock_negativo", valor: element.XMCNG });
                    result.lista.push({ codigo_interno: "formula_concreto", valor: element.FORMULA });
                    result.lista.push({ codigo_interno: "grupo_compra", valor: element.EKGRP });
                    result.lista.push({ codigo_interno: "unidad_medida_pedido", valor: element.BSTME });
                    result.lista.push({ codigo_interno: "precio_estandar", valor: element.STPRS });
                    result.lista.push({ codigo_interno: "precio_variable", valor: element.VERPR });
                    result.lista.push({ codigo_interno: "categoria_valoracion", valor: element.BKLAS });
                    result.lista.push({ codigo_interno: "control_precio", valor: element.VPRSV });
                    result.lista.push({ codigo_interno: "unidad_medida_almacen", valor: element.AUSME });
                    result.lista.push({ codigo_interno: "ubicacion", valor: element.LGPBE });
                    result.lista.push({ codigo_interno: "grupo_planif_necesidades", valor: element.DISGR });
                    result.lista.push({ codigo_interno: "tipo_mrp_caract_plani", valor: element.DISMM });
                    result.lista.push({ codigo_interno: "planif_necesidades", valor: element.DISPO });
                    result.lista.push({ codigo_interno: "calculo_tamano_lote", valor: element.DISLS });
                    result.lista.push({ codigo_interno: "clase_aprovis", valor: element.BESKZ });
                    result.lista.push({ codigo_interno: "aprovis_especial", valor: element.SOBSL });
                    result.lista.push({ codigo_interno: "toma_retrograda", valor: element.RGEKZ });
                    result.lista.push({ codigo_interno: "almacen_produccion", valor: element.LGPRO });
                    result.lista.push({ codigo_interno: "alm_aprov_ext", valor: element.LGFSB });
                    result.lista.push({ codigo_interno: "co_producto", valor: element.KZKUP });
                    result.lista.push({ codigo_interno: "tiempo_fab_propia_pn2", valor: element.DZEIT });
                    result.lista.push({ codigo_interno: "plaza_entrega_prev", valor: element.PLIFZ });
                    result.lista.push({ codigo_interno: "clave_horizonte", valor: element.FHORI });
                    result.lista.push({ codigo_interno: "stock_seguridad_pn2", valor: element.EISBE });
                    result.lista.push({ codigo_interno: "stock_seguridad_min_pn2", valor: element.EISLO });
                    result.lista.push({ codigo_interno: "nivel_servicio_pn2", valor: element.LGRAD });
                    result.lista.push({ codigo_interno: "indicador_periodo", valor: element.PERKZ });
                    result.lista.push({ codigo_interno: "grupo_estrategia", valor: element.STRGR });
                    result.lista.push({ codigo_interno: "planf_neces_mixtas", valor: element.MISKZ });
                    result.lista.push({ codigo_interno: "individual_colectivo", valor: element.SBDKZ });
                    result.lista.push({ codigo_interno: "rechazo_componente", valor: element.KAUSF });
                    result.lista.push({ codigo_interno: "sujeto_lote", valor: element.XCHPF });
                    result.lista.push({ codigo_interno: "responsable_control_produccion", valor: element.FEVOR });
                    result.lista.push({ codigo_interno: "perfil_control_fabricacion", valor: element.SFCPF });
                    result.lista.push({ codigo_interno: "unidad_medida_fabricacion", valor: element.FRTME });
                    result.lista.push({ codigo_interno: "exceso_sum_ilimitado", valor: element.UEETO });
                    result.lista.push({ codigo_interno: "modelo_pronostico", valor: element.PRMOD });
                    result.lista.push({ codigo_interno: "periodo_pasado", valor: element.PERAN });
                    result.lista.push({ codigo_interno: "periodo_pronostico", valor: element.ANZPR });
                    result.lista.push({ codigo_interno: "inicializacion", valor: element.KZINI });
                    result.lista.push({ codigo_interno: "limite_alarma", valor: element.SIGGR });
                    result.lista.push({ codigo_interno: "grado_optimizacion", valor: element.OPGRA });
                    result.lista.push({ codigo_interno: "proc_sel_modelo", valor: element.MODAV, });
                    result.lista.push({ codigo_interno: "anular_automaticamente", valor: element.AUTRU });
                    result.lista.push({ codigo_interno: "optimizacion_parametros", valor: element.KZPAR });
                    result.lista.push({ codigo_interno: "estructura_cuantica", valor: element.EKALR });
                    result.lista.push({ codigo_interno: "origen_material", valor: element.HKMAT });
                    result.lista.push({ codigo_interno: "tamano_lote", valor: element.LOSGR });
                    result.lista.push({ codigo_interno: "criticos", valor: element.ZZCRIT });
                    result.lista.push({ codigo_interno: "estrategicos", valor: element.ZZESTR });
                    result.lista.push({ codigo_interno: "material_codigo_sap", valor: element.MATNR });
                    result.lista.push({ codigo_interno: "LVORM_G", valor: element.LVORM_G });
                    result.lista.push({ codigo_interno: "LVORM_C", valor: element.LVORM_C });
                    result.lista.push({ codigo_interno: "LVORM_A", valor: element.LVORM_A });
                    result.lista.push({ codigo_interno: "LVORM_OV", valor: element.LVORM_OV });
                    result.lista.push({ codigo_interno: "NUMTP", valor: element.NUMTP });
                    result.lista.push({ codigo_interno: "MLAST", valor: element.MLAST });

                    break;
                }
            }
        }
    }

    return result;
};

service.consultarMaterialSAP = async (material) => {
    console.log('cpsaaApiProvider.consultarMaterial');

    let req = {
        consulta:
        {
            I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "",
            TI_ENTRADA: [
                {
                    "MATNR": material.codigo,
                    "WERKS": material.centro,
                    "LGORT": material.almacen,
                    "VKORG": material.organizacionVentas,
                    "VTWEG": material.canalDistribucion,
                }]
        }
    };

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [' + material.codigo + '] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.codigo + '] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.codigo + '] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', lista: [] };
    let eCentro = "";
    let eAlmacen = "";
    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];
                    eCentro = element.WERKS;
                    eAlmacen = element.LGORT;
                    result.lista.push({ codigo_interno: "ramo", valor: element.MBRSH });
                    result.lista.push({ codigo_interno: "denominacion", valor: element.MAKTX });
                    result.lista.push({ codigo_interno: "unidad_medida_base", valor: element.MEINS });
                    result.lista.push({ codigo_interno: "peso_bruto", valor: element.BRGEW });
                    result.lista.push({ codigo_interno: "unidad_medida_peso", valor: element.GEWEI });
                    result.lista.push({ codigo_interno: "centro_codigo_sap", valor: element.WERKS });
                    result.lista.push({ codigo_interno: "centro_beneficio_codigo_sap", valor: element.PRCTR });
                    result.lista.push({ codigo_interno: "almacen_codigo_sap", valor: element.LGORT });
                    result.lista.push({ codigo_interno: "organizacion_ventas", valor: element.VKORG });
                    result.lista.push({ codigo_interno: "canal_distribucion", valor: element.VTWEG });
                    result.lista.push({ codigo_interno: "tipo_material", valor: element.MTART });
                    result.lista.push({ codigo_interno: "grupo_articulo", valor: element.MATKL });
                    result.lista.push({ codigo_interno: "sector", valor: element.SPART });
                    result.lista.push({ codigo_interno: "grupo_tipo_posicion_gral", valor: element.MTPOS });
                    result.lista.push({ codigo_interno: "codigo_ean", valor: element.EAN11 });
                    result.lista.push({ codigo_interno: "unidad_medida_venta", valor: element.VRKME });
                    result.lista.push({ codigo_interno: "grupo_estadistica_mat", valor: element.VERSG });
                    result.lista.push({ codigo_interno: "grupo_tipo_posicion", valor: element.MTPOSV });
                    result.lista.push({ codigo_interno: "grupo_imputacion_material", valor: element.KTGRM });
                    result.lista.push({ codigo_interno: "jerarquia_producto", valor: element.PRODH });
                    result.lista.push({ codigo_interno: "grupos_material1", valor: element.MVGR1 });
                    result.lista.push({ codigo_interno: "grupos_material2", valor: element.MVGR2, });
                    result.lista.push({ codigo_interno: "verificacion_disponibilidad", valor: element.MTVFP });
                    result.lista.push({ codigo_interno: "grupo_transporte", valor: element.TRAGR });
                    result.lista.push({ codigo_interno: "grupo_carga", valor: element.LADGR });
                    result.lista.push({ codigo_interno: "stock_negativo", valor: element.XMCNG });
                    result.lista.push({ codigo_interno: "formula_concreto", valor: element.FORMULA });
                    result.lista.push({ codigo_interno: "grupo_compra", valor: element.EKGRP });
                    result.lista.push({ codigo_interno: "unidad_medida_pedido", valor: element.BSTME });
                    result.lista.push({ codigo_interno: "precio_estandar", valor: element.STPRS });
                    result.lista.push({ codigo_interno: "precio_variable", valor: element.VERPR });
                    result.lista.push({ codigo_interno: "categoria_valoracion", valor: element.BKLAS });
                    result.lista.push({ codigo_interno: "control_precio", valor: element.VPRSV });
                    result.lista.push({ codigo_interno: "unidad_medida_almacen", valor: element.AUSME });
                    result.lista.push({ codigo_interno: "ubicacion", valor: element.LGPBE });
                    result.lista.push({ codigo_interno: "grupo_planif_necesidades", valor: element.DISGR });
                    result.lista.push({ codigo_interno: "tipo_mrp_caract_plani", valor: element.DISMM });
                    result.lista.push({ codigo_interno: "planif_necesidades", valor: element.DISPO });
                    result.lista.push({ codigo_interno: "calculo_tamano_lote", valor: element.DISLS });
                    result.lista.push({ codigo_interno: "clase_aprovis", valor: element.BESKZ });
                    result.lista.push({ codigo_interno: "aprovis_especial", valor: element.SOBSL });
                    result.lista.push({ codigo_interno: "toma_retrograda", valor: element.RGEKZ });
                    result.lista.push({ codigo_interno: "almacen_produccion", valor: element.LGPRO });
                    result.lista.push({ codigo_interno: "alm_aprov_ext", valor: element.LGFSB });
                    result.lista.push({ codigo_interno: "co_producto", valor: element.KZKUP });
                    result.lista.push({ codigo_interno: "tiempo_fab_propia_pn2", valor: element.DZEIT });
                    result.lista.push({ codigo_interno: "plaza_entrega_prev", valor: element.PLIFZ });
                    result.lista.push({ codigo_interno: "clave_horizonte", valor: element.FHORI });
                    result.lista.push({ codigo_interno: "stock_seguridad_pn2", valor: element.EISBE });
                    result.lista.push({ codigo_interno: "stock_seguridad_min_pn2", valor: element.EISLO });
                    result.lista.push({ codigo_interno: "nivel_servicio_pn2", valor: element.LGRAD });
                    result.lista.push({ codigo_interno: "indicador_periodo", valor: element.PERKZ });
                    result.lista.push({ codigo_interno: "grupo_estrategia", valor: element.STRGR });
                    result.lista.push({ codigo_interno: "planf_neces_mixtas", valor: element.MISKZ });
                    result.lista.push({ codigo_interno: "individual_colectivo", valor: element.SBDKZ });
                    result.lista.push({ codigo_interno: "rechazo_componente", valor: element.KAUSF });
                    result.lista.push({ codigo_interno: "sujeto_lote", valor: element.XCHPF });
                    result.lista.push({ codigo_interno: "responsable_control_produccion", valor: element.FEVOR });
                    result.lista.push({ codigo_interno: "perfil_control_fabricacion", valor: element.SFCPF });
                    result.lista.push({ codigo_interno: "unidad_medida_fabricacion", valor: element.FRTME });
                    result.lista.push({ codigo_interno: "exceso_sum_ilimitado", valor: element.UEETO });
                    result.lista.push({ codigo_interno: "modelo_pronostico", valor: element.PRMOD });
                    result.lista.push({ codigo_interno: "periodo_pasado", valor: element.PERAN });
                    result.lista.push({ codigo_interno: "periodo_pronostico", valor: element.ANZPR });
                    result.lista.push({ codigo_interno: "inicializacion", valor: element.KZINI });
                    result.lista.push({ codigo_interno: "limite_alarma", valor: element.SIGGR });
                    result.lista.push({ codigo_interno: "grado_optimizacion", valor: element.OPGRA });
                    result.lista.push({ codigo_interno: "proc_sel_modelo", valor: element.MODAV, });
                    result.lista.push({ codigo_interno: "anular_automaticamente", valor: element.AUTRU });
                    result.lista.push({ codigo_interno: "optimizacion_parametros", valor: element.KZPAR });
                    result.lista.push({ codigo_interno: "estructura_cuantica", valor: element.EKALR });
                    result.lista.push({ codigo_interno: "origen_material", valor: element.HKMAT });
                    result.lista.push({ codigo_interno: "tamano_lote", valor: element.LOSGR });
                    result.lista.push({ codigo_interno: "criticos", valor: element.ZZCRIT });
                    result.lista.push({ codigo_interno: "estrategicos", valor: element.ZZESTR });
                    result.lista.push({ codigo_interno: "material_codigo_sap", valor: element.MATNR });
                    result.lista.push({ codigo_interno: "LVORM_G", valor: element.LVORM_G });
                    result.lista.push({ codigo_interno: "LVORM_C", valor: element.LVORM_C });
                    result.lista.push({ codigo_interno: "LVORM_A", valor: element.LVORM_A });
                    result.lista.push({ codigo_interno: "LVORM_OV", valor: element.LVORM_OV });
                    result.lista.push({ codigo_interno: "NUMTP", valor: element.NUMTP });
                    result.lista.push({ codigo_interno: "MLAST", valor: element.MLAST });
                    break;
                }
            }
        }
    }
    if (eCentro == "" || eAlmacen == "") {
        result = { codigo: 1, mensaje: '', lista: [] };
    }
    return result;
};

service.consultarCodigoMateriales = async (codigo_modelos) => {
    console.log('cpsaaApiProvider.consultarCodigoMateriales');

    let req = { consulta: { I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "", TI_ENTRADA: [] } };

    codigo_modelos.forEach(codigo_modelo => {
        req.consulta.TI_ENTRADA.push({ "MATNR": codigo_modelo });
    });

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', lista: [] };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];

                    const obj = {
                        material_codigo_modelo: element.MATNR,
                        ramo: element.MBRSH,
                        tipo_material: element.MTART,
                        grupo_articulo: element.MATKL,
                        sector: element.SPART
                    };

                    result.lista.push(obj);
                }
            }
        }
    }

    return result;
};

service.consultarCodigoMaterialAmpliacion = async (material) => {
    console.log('cpsaaApiProvider.consultarCodigoMaterialAmpliacion');

    let req = {
        consulta: {
            I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "", TI_ENTRADA: [{
                "MATNR": material.material_codigo_sap ? new String(material.material_codigo_sap) : "",
                "WERKS": material.centro_codigo_sap ? new String(material.centro_codigo_sap) : "",
                "LGORT": material.almacen_codigo_sap ? new String(material.almacen_codigo_sap) : "",
                "VKORG": material.organizacion_ventas ? new String(material.organizacion_ventas) : "",
                "VTWEG": material.canal_distribucion ? new String(material.canal_distribucion) : "",
                "BERID": material.area_planificacion ? new String(material.area_planificacion) : ""
            }]
        }
    };

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [' + material.material_codigo_sap + '] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.material_codigo_sap + '] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.material_codigo_sap + '] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', material: null };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];
                    result.material = {
                        material_codigo_sap: element.MATNR,
                        campos: mappingResponseCodigoMaterial(element)
                    };
                    break;
                }
            }
        }
    }

    return result;
};

service.consultarCodigoMaterialesAmpliacion = async (list_material) => {
    console.log('cpsaaApiProvider.consultarCodigoMaterialesAmpliacion');

    let req = { consulta: { I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "", TI_ENTRADA: [] } };

    list_material.forEach(material => {
        console.log("valores-->" + material.material_codigo_sap + "@@" + material.organizacion_ventas + "@@" + material.canal_distribucion);
        req.consulta.TI_ENTRADA.push({
            "MATNR": material.material_codigo_sap ? new String(material.material_codigo_sap) : "",
            "WERKS": material.centro_codigo_sap ? new String(material.centro_codigo_sap) : "",
            "LGORT": material.almacen_codigo_sap ? new String(material.almacen_codigo_sap) : "",
            "VKORG": material.organizacion_ventas ? new String(material.organizacion_ventas) : "",
            "VTWEG": material.canal_distribucion ? new String(material.canal_distribucion) : "",
            "BERID": material.area_planificacion ? new String(material.area_planificacion) : ""
        });
    });

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', materiales: [] };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];
                    result.materiales.push({ material_codigo_sap: element.MATNR, campos: mappingResponseCodigoMaterial(element) });
                }
            }
        }
    }

    return result;
};

service.consultarCodigoMaterialModificacion = async (material) => {
    console.log('cpsaaApiProvider.consultarCodigoMaterialModificacion');

    let req = {
        consulta: {
            I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "", TI_ENTRADA: [{
                "MATNR": material.material_codigo_sap ? new String(material.material_codigo_sap) : "",
                "WERKS": material.centro_codigo_sap ? new String(material.centro_codigo_sap) : "",
                "LGORT": material.almacen_codigo_sap ? new String(material.almacen_codigo_sap) : "",
                "VKORG": material.organizacion_ventas ? new String(material.organizacion_ventas) : "",
                "VTWEG": material.canal_distribucion ? new String(material.canal_distribucion) : "",
                "BERID": material.area_planificacion ? new String(material.area_planificacion) : ""
            }]
        }
    };

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [' + material.material_codigo_sap + '] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.material_codigo_sap + '] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [' + material.material_codigo_sap + '] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', material: null };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];
                    result.material = {
                        material_codigo_sap: element.MATNR,
                        centro_codigo_sap: element.WERKS,
                        almacen_codigo_sap: element.LGORT,
                        campos: mappingResponseCodigoMaterial(element)
                    };
                    break;
                }
            }
        }
    }

    return result;
};

service.consultarCodigoMaterialesModificacion = async (list_material) => {
    console.log('cpsaaApiProvider.consultarCodigoMaterialesModificacion');

    let req = { consulta: { I_PROCESO: "X", I_ACTIVO: "", I_MASIVO: "", I_SOLIC: "", TI_ENTRADA: [] } };

    list_material.forEach(material => {
        req.consulta.TI_ENTRADA.push({
            "MATNR": material.material_codigo_sap ? new String(material.material_codigo_sap) : "",
            "WERKS": material.centro_codigo_sap ? new String(material.centro_codigo_sap) : "",
            "LGORT": material.almacen_codigo_sap ? new String(material.almacen_codigo_sap) : "",
            "VKORG": material.organizacion_ventas ? new String(material.organizacion_ventas) : "",
            "VTWEG": material.canal_distribucion ? new String(material.canal_distribucion) : "",
            "BERID": material.area_planificacion ? new String(material.area_planificacion) : ""
        });
    });

    var host = config.cpsaaSapApi.hostConsultaMaterialCodigo;

    var request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        body: JSON.stringify(req),
        cache: 'no-cache'
    };

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Request...');
    console.log('******************************');
    console.log(request.body);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Enviando...');
    console.log('******************************');
    const data = await fetchWithRetry(host, request);
    console.log('******************************');

    console.log('\n******************************');
    console.log('SAP [consulta_codigo] - Response...');
    console.log('******************************');
    console.log(JSON.stringify(data));
    console.log('******************************');

    let result = { codigo: 0, mensaje: 'Error obteniendo materiales por código desde SAP', materiales: [] };

    if (data) {
        result.mensaje = data.mensaje;
        if (data.codigo === 1) {
            if (data.resultado !== '') {
                result.codigo = 1;
                for (let index = 0; index < data.resultado.TI_MATNR.length; index++) {
                    const element = data.resultado.TI_MATNR[index];
                    result.materiales.push({
                        material_codigo_sap: element.MATNR,
                        centro_codigo_sap: element.WERKS,
                        almacen_codigo_sap: element.LGORT,
                        campos: mappingResponseCodigoMaterial(element)
                    });
                }
            }
        }
    }

    return result;
};

function obtenerRegistroMaterialRequest(solicitud, list_regla_vista) {
    let req = { registro: { TI_SOLIC: [], TI_BERID: [], TI_CLASS: [], TI_TEXT_COM: [], TI_TEXT_PED: [], TI_UMALT: [], TI_ADJUNT: [] } };
    let ampliacion = {};

    solicitud.Materiales.forEach(element => {

        var itm_pm = element.id_material_solicitud ? element.id_material_solicitud.toString() : "";

        let LGRAD = "0.0";
        if (solicitud.NivelServicio) {
            const nivel_servicio = solicitud.NivelServicio.filter(function (item) { return item.id_material_solicitud == element.id_material_solicitud })[0] || null;
            if (nivel_servicio) {
                LGRAD = nivel_servicio.valor ? nivel_servicio.valor.toString() : "0.0";
            }
        }

        let QPART = "";
        if (solicitud.ClaseInspeccion) {
            const clase_inspeccion = solicitud.ClaseInspeccion.filter(function (item) { return item.id_material_solicitud == element.id_material_solicitud })[0] || null;
            if (clase_inspeccion) {
                QPART = clase_inspeccion.codigo_sap ? clase_inspeccion.codigo_sap.toString() : "";
            }
        }

        ampliacion[element.id_material_solicitud] = { id_padre: 0 };

        if (solicitud.tip_pm == 'C') {

            if (element.ampliacion === 'X') {
                for (let index = 0; index < solicitud.Materiales.length; index++) {
                    const padre = solicitud.Materiales[index];

                    if (padre.nombre_material === element.nombre_material) {
                        if (!padre.ampliacion || padre.ampliacion !== 'X') {
                            var keyElement = element.centro_codigo_sap + '-' + element.almacen_codigo_sap;
                            var keyPadre = padre.centro_codigo_sap + '-' + padre.almacen_codigo_sap;

                            if (keyElement !== keyPadre) {
                                ampliacion[element.id_material_solicitud].id_padre = padre.id_material_solicitud;
                                itm_pm = padre.id_material_solicitud ? padre.id_material_solicitud.toString() : "";
                                break;
                            }
                        }
                    }
                }
            }
        }

        var ti_solic = {
            SOL_PM: element.id_solicitud ? element.id_solicitud.toString() : "",
            DES_PM: element.nombre_solicitud ? element.nombre_solicitud.toString() : "",
            TIP_PM: solicitud.tip_pm, // 3	Tipo Solicitud	TIP_PM C (Creacion)	“B” (Bloqueo)
            ESC_PM: element.codigo_escenario_nivel3 ? element.codigo_escenario_nivel3.toString() : "",
            ITM_PM: itm_pm,
            MATNR: element.material_codigo_sap ? element.material_codigo_sap.toString() : "",
            WERKS: element.centro_codigo_sap ?? "",
            LGORT: element.almacen_codigo_sap ?? "",
            VKORG: element.organizacion_ventas ?? "",
            N_CEN: element.centro_codigo_sap ? "X" : "",
            N_ALM: element.almacen_codigo_sap ? "X" : "",
            N_OVEN: element.organizacion_ventas ? "X" : "",
            VTWEG: element.canal_distribucion ?? "",
            MAKTX: element.nombre_material ?? "",
            MBRSH: element.ramo ?? "",
            MTART: element.tipo_material ?? "",
            MEINS: element.unidad_medida_base ?? "",
            MATKL: element.grupo_articulo ?? "",
            SPART: element.sector ?? "",
            MTPOS: element.grupo_tipo_posicion_gral ?? "",
            BRGEW: element.peso_bruto ? element.peso_bruto.toString() : "0.00",
            GEWEI: element.unidad_medida_peso ?? "",
            EAN11: element.codigo_ean ?? "",
            STAWN: element.partida_arancelaria ?? "",
            MTVFP: element.verificacion_disponibilidad ?? "",
            TRAGR: element.grupo_transporte ?? "",
            LADGR: element.grupo_carga ?? "",
            PRCTR: element.centro_beneficio_codigo_sap ?? "",
            XMCNG: element.stock_negativo ?? "",
            EKGRP: element.grupo_compra ?? "",
            BSTME: element.unidad_medida_pedido ?? "",
            VABME: element.ump_var ?? "",
            KAUTB: element.ind_ped_automa ?? "",
            FORMULA: element.formula_concreto ?? "",
            ZECRIT: element.criticos ?? "",
            ZEESTR: element.estrategicos ?? "",
            VRKME: element.unidad_medida_venta ?? "",
            VERSG: element.grupo_estadistica_mat ?? "",
            MTPOSV: element.grupo_tipo_posicion ?? "",
            KTGRM: element.grupo_imputacion_material ?? "",
            PRODH_D: element.jerarquia_producto ?? "",
            MVGR1: element.grupo_material1 ?? "",
            MVGR2: element.grupo_material2 ?? "",
            AUSME: element.unidad_medida_almacen ?? "",
            LGPBE: element.ubicacion ?? "",
            STPRS: element.precio_estandar ? element.precio_estandar.toString() : "0.00",
            VERPR: element.precio_variable ? element.precio_variable.toString() : "0.00",
            BKLAS: element.categoria_valoracion ?? "",
            VPRSV: element.control_precio ?? "",
            ABST: element.determinacion_precio ?? "",
            DISGR: element.grupo_planif_necesidades ?? "",
            DISMM: element.tipo_mrp_caract_plani ?? "",
            DISPO: element.planif_necesidades ?? "",
            DISLS: element.calculo_tamano_lote ?? "",
            BESKZ: element.clase_aprovis ?? "",
            SOBSL: element.aprovis_especial ?? "",
            RGEKZ: element.toma_retrograda ?? "",
            LGPRO: element.almacen_produccion ?? "",
            LGFSB: element.alm_aprov_ext_pn2_almacen ?? "",
            KZKUP: element.co_producto ?? "",
            DZEIT: element.tiempo_fab_propia_pn2 ? element.tiempo_fab_propia_pn2.toString() : "0",
            PLIFZ: element.plaza_entrega_prev ? element.plaza_entrega_prev.toString() : "0",
            FHORI: element.clave_horizonte ?? "",
            EISBE: element.stock_seguridad_pn2 ? element.stock_seguridad_pn2.toString() : "0.000",
            EISLO: element.stock_seguridad_min_pn2 ? element.stock_seguridad_min_pn2.toString() : "0.000",
            LGRAD: LGRAD,
            PERKZ: element.indicador_periodo ?? "",
            STRGR: element.grupo_estrategia ?? "",
            MISKZ: element.planf_neces_mixtas ?? "",
            SBDKZ: element.individual_colectivo ?? "",
            KAUSF: element.rechazo_componente ? element.rechazo_componente.toString() : "0.00",
            XCHPF: element.sujeto_lote ?? "",
            FEVOR: element.responsable_control_produccion ?? "",
            SFCPF: element.perfil_control_fabricacion ?? "",
            FRTME: element.unidad_medida_fabricacion ?? "",
            UEETO: element.limite_exceso_sum_ilimitado ? element.limite_exceso_sum_ilimitado.toString() : "0.0",
            UEETK: element.exceso_sum_ilimitado ?? "",
            PRMOD: element.modelo_pronostico ?? "",
            PERAN: element.periodo_pasado ? element.periodo_pasado.toString() : "0",
            ANZPR: element.periodo_pronostico ? element.periodo_pronostico.toString() : "0",
            KZINI: element.inicializacion ?? "",
            SIGGR: element.limite_alarma ? element.limite_alarma.toString() : "0.000",
            OPGRA: element.grado_optimizacion ?? "",
            MODAV: element.proc_sel_modelo ?? "",
            AUTRU: element.anular_automaticamente ?? "",
            KZPAR: element.optimizacion_parametro ?? "",
            EKALR: element.estructura_cuantica ?? "",
            HKMAT: element.origen_material ?? "",
            LOSGR: element.tamano_lote ? element.tamano_lote.toString() : "0.000",
            QPART: QPART,
            V_VENT: "",
            V_COMP: "",
            V_CONT: "",
            V_PLAN: "",
            V_MRP: "",
            V_PTRB: "",
            V_PRON: "",
            V_CALI: "",
            V_CCOS: "",
            NML_PM: element.nombre_anexo ?? "",
            LNK_PM: element.ruta_anexo ?? "",
            REPROC: element.material_codigo_sap ? "X" : ""
        };

        if (list_regla_vista) {
            ti_solic.V_VENT = obtener_flag_V_VENT(ti_solic, list_regla_vista);
            ti_solic.V_COMP = obtener_flag_V_COMP(ti_solic, list_regla_vista);
            ti_solic.V_CONT = obtener_flag_V_CONT(ti_solic, list_regla_vista);
            ti_solic.V_CALI = obtener_flag_V_CALI(ti_solic, list_regla_vista);
            ti_solic.V_CCOS = obtener_flag_V_CCOS(ti_solic, list_regla_vista);

            if (element.vista_planificacion && element.vista_planificacion == 'X') {
                ti_solic.V_PLAN = obtener_flag_V_PLAN(ti_solic, list_regla_vista);
                ti_solic.V_MRP = obtener_flag_V_MRP(ti_solic, list_regla_vista, solicitud.AreaPlanificacion);
                ti_solic.V_PRON = obtener_flag_V_PRON(ti_solic, list_regla_vista);
                ti_solic.V_PTRB = obtener_flag_V_PTRB(ti_solic, list_regla_vista);
            }
        }

        req.registro.TI_SOLIC.push(ti_solic);

        if (element.texto_comercial) {
            var chunks = element.texto_comercial.match(/.{1,138}/g);
            var counter = 1;
            chunks.forEach(texto_comercial => {
                req.registro.TI_TEXT_COM.push({
                    ITM_PM: ampliacion[element.id_material_solicitud].id_padre === 0 ? new String(element.id_material_solicitud) : new String(ampliacion[element.id_material_solicitud].id_padre),
                    VKORG: element.organizacion_ventas ?? "",
                    VTWEG: element.canal_distribucion ?? "",
                    SECUEN: counter.toString(),
                    TDLINE: new String(texto_comercial)
                });
                counter++;
            });
        }

        if (element.texto_compra) {
            var chunks = element.texto_compra.match(/.{1,138}/g);
            var counter = 1;
            chunks.forEach(texto_compra => {
                req.registro.TI_TEXT_PED.push({
                    ITM_PM: ampliacion[element.id_material_solicitud].id_padre === 0 ? new String(element.id_material_solicitud) : new String(ampliacion[element.id_material_solicitud].id_padre),
                    SECUEN: counter.toString(),
                    TDLINE: new String(texto_compra)
                });
                counter++;
            });
        }
    });

    if (solicitud.AreaPlanificacion) {
        solicitud.AreaPlanificacion.forEach(element => {

            let LGRAD = "0.0";
            if (solicitud.NivelServicio) {
                const nivel_servicio = solicitud.NivelServicio.filter(function (item) { return item.id_material_solicitud == element.id_material_solicitud })[0] || null;
                if (nivel_servicio) {
                    LGRAD = nivel_servicio.valor ? nivel_servicio.valor.toString() : "0.0";
                }
            }

            req.registro.TI_BERID.push({
                ITM_PM: ampliacion[element.id_material_solicitud].id_padre === 0 ? new String(element.id_material_solicitud) : new String(ampliacion[element.id_material_solicitud].id_padre),
                WERKS: element.centro_codigo_sap ?? "",
                BERID: element.area_planificacion ?? "",
                DISGR: element.grupo_planif_necesidades ?? "",
                DISMM: element.tipo_mrp_caract_plani ?? "",
                MINBE: "0",//punto_pedido
                MABST: "0",//Stock Alm Maximo
                DISPO: element.planif_necesidades ?? "",
                DISLS: element.calculo_tamano_lote ?? "",
                BSTRF: "0",//Valor Redondeo
                LGFSB: element.alm_aprov_ext_pn2_almacen ?? "",
                PLIFZ: element.plaza_entrega_prev ? element.plaza_entrega_prev.toString() : "0",
                LGRAD: LGRAD,
                EISBE: element.stock_seguridad_pn2 ? element.stock_seguridad_pn2.toString() : "0.000",
                SHFLG: "",//Indicador de Marg. Seg.
                SHZET: "0",//Margen Seguridad
                PRMOD: element.modelo_pronostico ?? "",
                PERAN: element.periodo_pasado ? element.periodo_pasado.toString() : "0",
                ANZPR: element.periodo_pronostico ? element.periodo_pronostico.toString() : "0",
                PERIO: "0",//Periodo Por Estación
                SIGGR: element.limite_alarma ? element.limite_alarma.toString() : "0.000"
            });

        });
    }

    if (solicitud.Clasificaciones) {
        solicitud.Clasificaciones.forEach(element => {

            req.registro.TI_CLASS.push({
                ITM_PM: ampliacion[element.id_material_solicitud].id_padre === 0 ? new String(element.id_material_solicitud) : new String(ampliacion[element.id_material_solicitud].id_padre),
                SECUEN: new String(element.id_clasificacion),
                KLASSE: new String(element.codigo_sap)
            });

        });
    }

    if (solicitud.EquivalenciaMaterial) {
        var counter = 1;
        solicitud.EquivalenciaMaterial.forEach(element => {

            req.registro.TI_UMALT.push({
                ITEM: ampliacion[element.id_material_solicitud].id_padre === 0 ? new String(element.id_material_solicitud) : new String(ampliacion[element.id_material_solicitud].id_padre),
                SECUEN: new String(counter),
                UMREN: new String(element.valor1),
                MEINH: new String(element.unidad_medida1),
                UMREZ: new String(element.valor2),
                MEINS: new String(element.unidad_medida2)
            });
            counter++;
        });
    }

    if (solicitud.Anexos) {
        var counter = 1;
        solicitud.Anexos.forEach(element => {

            req.registro.TI_ADJUNT.push({
                ITEM: ampliacion[element.id_material_solicitud].id_padre === 0 ? new String(element.id_material_solicitud) : new String(ampliacion[element.id_material_solicitud].id_padre),
                SECUEN: new String(counter),
                NML_PM: new String(element.nombre),
                LNK_PM: new String(element.ruta_anexo)
            });
            counter++;

        });
    }

    return req;
};

function obtener_flag_V_VENT(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.ventas;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            if (regla.codigo_interno == enums.codigo_interno.centro_beneficio_codigo_sap) {
                if (material.PRCTR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.organizacion_ventas) {
                if (material.VKORG != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.canal_distribucion) {
                if (material.VTWEG != "") {
                    return "X";
                }
            }

            // else if (regla.codigo_interno == enums.codigo_interno.clasificacion_tab) {
            //     if (material.PRCTR != "") {
            //         return "X";
            //     }
            // }

            //else if (regla.codigo_interno == enums.codigo_interno.clasificacion_fiscal) {
            //     if (material.PRCTR != "") {
            //         return "X";
            //     }
            // }

            else if (regla.codigo_interno == enums.codigo_interno.unidad_medida_venta) {
                if (material.VRKME != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_estadistica_mat) {
                if (material.VERSG != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_tipo_posicion) {
                if (material.MTPOSV != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_imputacion_material) {
                if (material.KTGRM != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.jerarquia_producto) {
                if (material.PRODH_D != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_material1) {
                if (material.MVGR1 != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_material2) {
                if (material.MVGR2 != "") {
                    return "X";
                }
            }

            //else if (regla.codigo_interno == enums.codigo_interno.texto_comercial) {
            //     if (material.PRCTR != "") {
            //         return "X";
            //     }
            // }

            else if (regla.codigo_interno == enums.codigo_interno.verificacion_disponibilidad) {
                if (material.MTVFP != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_transporte) {
                if (material.TRAGR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_carga) {
                if (material.LADGR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.stock_negativo) {
                if (material.XMCNG != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.formula_concreto) {
                if (material.FORMULA != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.precio_variable) {
                if (material.VERPR != "0.00") {
                    return "X";
                }
            }

            //else if (regla.codigo_interno == enums.codigo_interno.dcto_pronto_pago) {
            //     if (material.PRCTR != "") {
            //         return "X";
            //     }
            // }
        }
    }

    return "";
};

function obtener_flag_V_COMP(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.compras;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];
            
            // if (regla.codigo_interno == enums.codigo_interno.texto_compra) {
            //     if (material.FORMULA != "") {
            //         return "X";
            //     }
            // }
            if (regla.codigo_interno == enums.codigo_interno.grupo_compra) {
                if (material.EKGRP != "") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.unidad_medida_pedido) {
                if (material.BSTME != "") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.ump_var) {
                if (material.VABME != "") {
                    return "X";
                }
            }
            
            //else if (regla.codigo_interno == enums.codigo_interno.idioma) {
            //     if (material.FORMULA != "") {
            //         return "X";
            //     }
            // }
            
            else if (regla.codigo_interno == enums.codigo_interno.ind_ped_automa) {
                if (material.KAUTB != "") {
                    return "X";
                }
            }
        }
    }

    return "";
};

function obtener_flag_V_CONT(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.contabilidad;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            if (regla.codigo_interno == enums.codigo_interno.centro_beneficio_codigo_sap) {
                if (material.PRCTR != "") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.precio_estandar) {
                if (material.STPRS != "0.00") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.precio_variable) {
                if (material.VERPR != "0.00") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.categoria_valoracion) {
                if (material.BKLAS != "") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.control_precio) {
                if (material.VPRSV != "") {
                    return "X";
                }
            }
            
            else if (regla.codigo_interno == enums.codigo_interno.determinacion_precio) {
                if (material.ABST != "") {
                    return "X";
                }
            }
            
            //else if (regla.codigo_interno == enums.codigo_interno.cantidad_base) {
            //     if (material.KAUTB != "") {
            //         return "X";
            //     }
            // }
        }
    }

    return "";
};

function obtener_flag_V_PLAN(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.planif_necesi;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];
            if (regla.codigo_interno == enums.codigo_interno.centro_beneficio_codigo_sap) {
                if (material.PRCTR != "") {
                    return "X";
                }
            }
            // if (regla.codigo_interno == enums.codigo_interno.clasificacion_tab) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }
            // if (regla.codigo_interno == enums.codigo_interno.texto_compra) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }

            else if (regla.codigo_interno == enums.codigo_interno.verificacion_disponibilidad) {
                if (material.MTVFP != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.unidad_medida_pedido) {
                if (material.BSTME != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_planif_necesidades) {
                if (material.DISGR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.tipo_mrp_caract_plani) {
                if (material.DISMM != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.planif_necesidades) {
                if (material.DISPO != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.calculo_tamano_lote) {
                if (material.DISLS != "") {
                    return "X";
                }
            }

            //             else if (regla.codigo_interno == enums.codigo_interno.area_planificacion_tab) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }

            //             else if (regla.codigo_interno == enums.codigo_interno.grupo_planif_necesidades_tab) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.nivel_servicio_tab) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.modelo_pronostico_tab) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }

            else if (regla.codigo_interno == enums.codigo_interno.clase_aprovis) {
                if (material.BESKZ != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.aprovis_especial) {
                if (material.SOBSL != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.toma_retrograda) {
                if (material.RGEKZ != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.almacen_produccion) {
                if (material.LGPRO != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.alm_aprov_ext) {
                if (material.LGFSB != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.co_producto) {
                if (material.KZKUP != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.tiempo_fab_propia_pn2) {
                if (material.DZEIT != "0") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.plaza_entrega_prev) {
                if (material.PLIFZ != "0") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.clave_horizonte) {
                if (material.FHORI != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.stock_seguridad_pn2) {
                if (material.EISBE != "0.000") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.stock_seguridad_min_pn2) {
                if (material.EISLO != "0.000") {
                    return "X";
                }
            }

            //else if (regla.codigo_interno == enums.codigo_interno.nivel_servicio_pn2) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }

            else if (regla.codigo_interno == enums.codigo_interno.indicador_periodo) {
                if (material.PERKZ != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grupo_estrategia) {
                if (material.STRGR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.planf_neces_mixtas) {
                if (material.MISKZ != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.individual_colectivo) {
                if (material.SBDKZ != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.rechazo_componente) {
                if (material.KAUSF != "0.00") {
                    return "X";
                }
            }

            //else if (regla.codigo_interno == enums.codigo_interno.vista_planificacion) {
            //     if (material.ABST != "") {
            //         return "X";
            //     }
            // }
        }
    }

    return "";
};

function obtener_flag_V_MRP(material, list_regla_vista, area_planificacion) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.planif_necesi;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            if (regla.codigo_interno == enums.codigo_interno.area_planificacion_tab) {
                if (area_planificacion && area_planificacion.length > 0) {
                    return "X";
                }
            }

            // else if (regla.codigo_interno == enums.codigo_interno.grupo_planif_necesidades_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.caracteristica_necesidad_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.punto_pedido_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.stock_alm_max_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.planif_necesidades_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.calculo_tamano_lote_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.valor_redondeo_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.alm_aprov_ext_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.plazo_entrega_prev_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            else if (regla.codigo_interno == enums.codigo_interno.nivel_servicio_tab) {
                if (material.LGRAD != "0.0") {
                    return "X";
                }
            }

            // else if (regla.codigo_interno == enums.codigo_interno.stock_seguridad_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.indicador_margen_seg_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.margen_seguridad_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.modelo_pronostico_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.periodo_pasado_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.periodo_pronostico_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.periodo_estaci_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.limite_alarma_tab) {
            //     if (material.XCHPF != "") {
            //         return "X";
            //     }
            // }

        }
    }

    return "";
};

function obtener_flag_V_PTRB(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.prep_de_trabajo;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            if (regla.codigo_interno == enums.codigo_interno.sujeto_lote) {
                if (material.XCHPF != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.responsable_control_produccion) {
                if (material.FEVOR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.perfil_control_fabricacion) {
                if (material.SFCPF != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.unidad_medida_fabricacion) {
                if (material.FRTME != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.limite_exceso_sum_ilimitado) {
                if (material.UEETO != "0.0") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.exceso_sum_ilimitado) {
                if (material.UEETK != "") {
                    return "X";
                }
            }
        }
    }

    return "";
};

function obtener_flag_V_PRON(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.pronostico;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            // if (regla.codigo_interno == enums.codigo_interno.periodo_pasado_tab) {
            //     if (material.KAUSF != "") {
            //         return "X";
            //     }
            // }

            // else if (regla.codigo_interno == enums.codigo_interno.periodo_pronostico_tab) {
            //     if (material.KAUSF != "") {
            //         return "X";
            //     }
            // }

            if (regla.codigo_interno == enums.codigo_interno.modelo_pronostico) {
                if (material.PRMOD != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.inicializacion) {
                if (material.KZINI != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.limite_alarma) {
                if (material.SIGGR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.grado_optimizacion) {
                if (material.OPGRA != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.proc_sel_modelo) {
                if (material.MODAV != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.anular_autormaticamente) {
                if (material.AUTRU != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.optimizacion_parametros) {
                if (material.KZPAR != "") {
                    return "X";
                }
            }
        }
    }

    return "";
};

function obtener_flag_V_CALI(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.gest_calidad;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            if (regla.codigo_interno == enums.codigo_interno.clase_inspeccion_tab) {
                if (material.QPART != "") {
                    return "X";
                }
            }
        }
    }

    return "";
};

function obtener_flag_V_CCOS(material, list_regla_vista) {
    const reglas = list_regla_vista.filter(function (item) {
        return item.id === enums.vista_portal.cal_coste;
    });

    if (reglas) {
        for (let index = 0; index < reglas.length; index++) {
            const regla = reglas[index];

            if (regla.codigo_interno == enums.codigo_interno.estructura_cuantica) {
                if (material.EKALR != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.origen_material) {
                if (material.HKMAT != "") {
                    return "X";
                }
            }

            else if (regla.codigo_interno == enums.codigo_interno.tamano_lote) {
                if (material.LOSGR != "0.000") {
                    return "X";
                }
            }
        }
    }
    return "";
};

async function fetchWithRetry(host, request) {
    let response = null;
    const maxRetries = config.retry.maxRetries;
    const waitFor = config.retry.waitFor;

    for (let retry = 1; retry <= maxRetries; retry++) {
        console.log('[DoRetry] try number: ' + retry);
        try {
            response = await fetch(host, request);
            console.log(response.status);

            if (response.status === 200) {
                const data = await response.json();
                //                console.log(JSON.stringify(data));

                if (data.codigo === 1) {
                    return data;
                } else {
                    await new Promise(resolve => setTimeout(resolve, waitFor));
                    continue;
                }
            }
            else {
                await new Promise(resolve => setTimeout(resolve, waitFor));
                continue;
            }
        } catch (error) {
            console.log(error);
            await new Promise(resolve => setTimeout(resolve, waitFor));
            continue;
        }
    }

    if (response) {
        return await response.json();
    }
    else { return null }
};

function mappingResponseCodigoMaterial(element) {
    const lista = [];

    if (!valor_invalido(element.MBRSH)) {
        lista.push({ codigo_interno: "ramo", valor: element.MBRSH });
    }

    if (!valor_invalido(element.MAKTX)) {
        lista.push({ codigo_interno: "denominacion", valor: element.MAKTX });
    }

    if (!valor_invalido(element.MEINS)) {
        lista.push({ codigo_interno: "unidad_medida_base", valor: element.MEINS });
    }

    if (!valor_invalido(element.BRGEW)) {
        lista.push({ codigo_interno: "peso_bruto", valor: element.BRGEW });
    }

    if (!valor_invalido(element.GEWEI)) {
        lista.push({ codigo_interno: "unidad_medida_peso", valor: element.GEWEI });
    }

    if (!valor_invalido(element.WERKS)) {
        lista.push({ codigo_interno: "centro_codigo_sap", valor: element.WERKS });
    }

    if (!valor_invalido(element.PRCTR)) {
        lista.push({ codigo_interno: "centro_beneficio_codigo_sap", valor: element.PRCTR });
    }

    if (!valor_invalido(element.LGORT)) {
        lista.push({ codigo_interno: "almacen_codigo_sap", valor: element.LGORT });
    }

    if (!valor_invalido(element.VKORG)) {
        lista.push({ codigo_interno: "organizacion_ventas", valor: element.VKORG });
    }

    if (!valor_invalido(element.VTWEG)) {
        lista.push({ codigo_interno: "canal_distribucion", valor: element.VTWEG });
    }

    if (!valor_invalido(element.MTART)) {
        lista.push({ codigo_interno: "tipo_material", valor: element.MTART });
    }

    if (!valor_invalido(element.MATKL)) {
        lista.push({ codigo_interno: "grupo_articulo", valor: element.MATKL });
    }

    if (!valor_invalido(element.SPART)) {
        lista.push({ codigo_interno: "sector", valor: element.SPART });
    }

    if (!valor_invalido(element.MTPOS)) {
        lista.push({ codigo_interno: "grupo_tipo_posicion_gral", valor: element.MTPOS });
    }

    if (!valor_invalido(element.EAN11)) {
        lista.push({ codigo_interno: "codigo_ean", valor: element.EAN11 });
    }

    if (!valor_invalido(element.VRKME)) {
        lista.push({ codigo_interno: "unidad_medida_venta", valor: element.VRKME });
    }

    if (!valor_invalido(element.VERSG)) {
        lista.push({ codigo_interno: "grupo_estadistica_mat", valor: element.VERSG });
    }

    if (!valor_invalido(element.MTPOSV)) {
        lista.push({ codigo_interno: "grupo_tipo_posicion", valor: element.MTPOSV });
    }

    if (!valor_invalido(element.KTGRM)) {
        lista.push({ codigo_interno: "grupo_imputacion_material", valor: element.KTGRM });
    }

    if (!valor_invalido(element.PRODH)) {
        lista.push({ codigo_interno: "jerarquia_producto", valor: element.PRODH });
    }

    if (!valor_invalido(element.MVGR1)) {
        lista.push({ codigo_interno: "grupos_material1", valor: element.MVGR1 });
    }

    if (!valor_invalido(element.MVGR1)) {
        lista.push({ codigo_interno: "grupos_material2", valor: element.MVGR2 });
    }

    if (!valor_invalido(element.MTVFP)) {
        lista.push({ codigo_interno: "verificacion_disponibilidad", valor: element.MTVFP });
    }

    if (!valor_invalido(element.TRAGR)) {
        lista.push({ codigo_interno: "grupo_transporte", valor: element.TRAGR });
    }

    if (!valor_invalido(element.LADGR)) {
        lista.push({ codigo_interno: "grupo_carga", valor: element.LADGR });
    }

    if (!valor_invalido(element.XMCNG)) {
        lista.push({ codigo_interno: "stock_negativo", valor: element.XMCNG });
    }

    if (!valor_invalido(element.FORMULA)) {
        lista.push({ codigo_interno: "formula_concreto", valor: element.FORMULA });
    }

    if (!valor_invalido(element.EKGRP)) {
        lista.push({ codigo_interno: "grupo_compra", valor: element.EKGRP });
    }

    if (!valor_invalido(element.BSTME)) {
        lista.push({ codigo_interno: "unidad_medida_pedido", valor: element.BSTME });
    }

    if (!valor_invalido(element.STPRS)) {
        lista.push({ codigo_interno: "precio_estandar", valor: element.STPRS });
    }

    if (!valor_invalido(element.VERPR)) {
        lista.push({ codigo_interno: "precio_variable", valor: element.VERPR });
    }

    if (!valor_invalido(element.BKLAS)) {
        lista.push({ codigo_interno: "categoria_valoracion", valor: element.BKLAS });
    }

    if (!valor_invalido(element.VPRSV)) {
        lista.push({ codigo_interno: "control_precio", valor: element.VPRSV });
    }

    if (!valor_invalido(element.AUSME)) {
        lista.push({ codigo_interno: "unidad_medida_almacen", valor: element.AUSME });
    }

    if (!valor_invalido(element.LGPBE)) {
        lista.push({ codigo_interno: "ubicacion", valor: element.LGPBE });
    }

    if (!valor_invalido(element.DISGR)) {
        lista.push({ codigo_interno: "grupo_planif_necesidades", valor: element.DISGR });
    }

    if (!valor_invalido(element.DISMM)) {
        lista.push({ codigo_interno: "tipo_mrp_caract_plani", valor: element.DISMM });
    }

    if (!valor_invalido(element.DISPO)) {
        lista.push({ codigo_interno: "planif_necesidades", valor: element.DISPO });
    }

    if (!valor_invalido(element.DISLS)) {
        lista.push({ codigo_interno: "calculo_tamano_lote", valor: element.DISLS });
    }

    if (!valor_invalido(element.BESKZ)) {
        lista.push({ codigo_interno: "clase_aprovis", valor: element.BESKZ });
    }

    if (!valor_invalido(element.SOBSL)) {
        lista.push({ codigo_interno: "aprovis_especial", valor: element.SOBSL });
    }

    if (!valor_invalido(element.RGEKZ)) {
        lista.push({ codigo_interno: "toma_retrograda", valor: element.RGEKZ });
    }

    if (!valor_invalido(element.LGPRO)) {
        lista.push({ codigo_interno: "almacen_produccion", valor: element.LGPRO });
    }

    if (!valor_invalido(element.LGFSB)) {
        lista.push({ codigo_interno: "alm_aprov_ext", valor: element.LGFSB });
    }

    if (!valor_invalido(element.KZKUP)) {
        lista.push({ codigo_interno: "co_producto", valor: element.KZKUP });
    }

    if (!valor_invalido(element.DZEIT)) {
        lista.push({ codigo_interno: "tiempo_fab_propia_pn2", valor: element.DZEIT });
    }

    if (!valor_invalido(element.PLIFZ)) {
        lista.push({ codigo_interno: "plaza_entrega_prev", valor: element.PLIFZ });
    }

    if (!valor_invalido(element.FHORI)) {
        lista.push({ codigo_interno: "clave_horizonte", valor: element.FHORI });
    }

    if (!valor_invalido(element.EISBE)) {
        lista.push({ codigo_interno: "stock_seguridad_pn2", valor: element.EISBE });
    }

    if (!valor_invalido(element.EISLO)) {
        lista.push({ codigo_interno: "stock_seguridad_min_pn2", valor: element.EISLO });
    }

    if (!valor_invalido(element.LGRAD)) {
        lista.push({ codigo_interno: "nivel_servicio_pn2", valor: element.LGRAD });
    }

    if (!valor_invalido(element.PERKZ)) {
        lista.push({ codigo_interno: "indicador_periodo", valor: element.PERKZ });
    }

    if (!valor_invalido(element.STRGR)) {
        lista.push({ codigo_interno: "grupo_estrategia", valor: element.STRGR });
    }

    if (!valor_invalido(element.MISKZ)) {
        lista.push({ codigo_interno: "planf_neces_mixtas", valor: element.MISKZ });
    }

    if (!valor_invalido(element.SBDKZ)) {
        lista.push({ codigo_interno: "individual_colectivo", valor: element.SBDKZ });
    }

    if (!valor_invalido(element.KAUSF)) {
        lista.push({ codigo_interno: "rechazo_componente", valor: element.KAUSF });
    }

    if (!valor_invalido(element.XCHPF)) {
        lista.push({ codigo_interno: "sujeto_lote", valor: element.XCHPF });
    }

    if (!valor_invalido(element.FEVOR)) {
        lista.push({ codigo_interno: "responsable_control_produccion", valor: element.FEVOR });
    }

    if (!valor_invalido(element.SFCPF)) {
        lista.push({ codigo_interno: "perfil_control_fabricacion", valor: element.SFCPF });
    }

    if (!valor_invalido(element.FRTME)) {
        lista.push({ codigo_interno: "unidad_medida_fabricacion", valor: element.FRTME });
    }

    if (!valor_invalido(element.UEETO)) {
        lista.push({ codigo_interno: "exceso_sum_ilimitado", valor: element.UEETO });
    }

    if (!valor_invalido(element.PRMOD)) {
        lista.push({ codigo_interno: "modelo_pronostico", valor: element.PRMOD });
    }

    if (!valor_invalido(element.PERAN)) {
        lista.push({ codigo_interno: "periodo_pasado", valor: element.PERAN });
    }

    if (!valor_invalido(element.ANZPR)) {
        lista.push({ codigo_interno: "periodo_pronostico", valor: element.ANZPR });
    }

    if (!valor_invalido(element.KZINI)) {
        lista.push({ codigo_interno: "inicializacion", valor: element.KZINI });
    }

    if (!valor_invalido(element.SIGGR)) {
        lista.push({ codigo_interno: "limite_alarma", valor: element.SIGGR });
    }

    if (!valor_invalido(element.OPGRA)) {
        lista.push({ codigo_interno: "grado_optimizacion", valor: element.OPGRA });
    }

    if (!valor_invalido(element.MODAV)) {
        lista.push({ codigo_interno: "proc_sel_modelo", valor: element.MODAV });
    }

    if (!valor_invalido(element.AUTRU)) {
        lista.push({ codigo_interno: "anular_automaticamente", valor: element.AUTRU });
    }

    if (!valor_invalido(element.KZPAR)) {
        lista.push({ codigo_interno: "optimizacion_parametros", valor: element.KZPAR });
    }

    if (!valor_invalido(element.EKALR)) {
        lista.push({ codigo_interno: "estructura_cuantica", valor: element.EKALR });
    }

    if (!valor_invalido(element.HKMAT)) {
        lista.push({ codigo_interno: "origen_material", valor: element.HKMAT });
    }

    if (!valor_invalido(element.LOSGR)) {
        lista.push({ codigo_interno: "tamano_lote", valor: element.LOSGR });
    }

    if (!valor_invalido(element.ZZCRIT)) {
        lista.push({ codigo_interno: "criticos", valor: element.ZZCRIT });
    }

    if (!valor_invalido(element.ZZESTR)) {
        lista.push({ codigo_interno: "estrategicos", valor: element.ZZESTR });
    }

    if (!valor_invalido(element.MATNR)) {
        lista.push({ codigo_interno: "material_codigo_sap", valor: element.MATNR });
    }

    if (!valor_invalido(element.LVORM_G)) {
        lista.push({ codigo_interno: "LVORM_G", valor: element.LVORM_G });
    }

    if (!valor_invalido(element.LVORM_C)) {
        lista.push({ codigo_interno: "LVORM_C", valor: element.LVORM_C });
    }

    if (!valor_invalido(element.LVORM_A)) {
        lista.push({ codigo_interno: "LVORM_A", valor: element.LVORM_A });
    }

    if (!valor_invalido(element.LVORM_OV)) {
        lista.push({ codigo_interno: "LVORM_OV", valor: element.LVORM_OV });
    }

    if (!valor_invalido(element.NUMTP)) {
        lista.push({ codigo_interno: "NUMTP", valor: element.NUMTP });
    }

    if (!valor_invalido(element.MLAST)) {
        lista.push({ codigo_interno: "MLAST", valor: element.MLAST });
    }

    return lista;
};

function valor_invalido(element) {
    if (!element) {
        return true
    }

    if (element == constantes.emptyString) {
        return true;
    }

    if (element == "0") {
        return true;
    }

    if (element == "0.0") {
        return true;
    }

    if (element == "0.00") {
        return true;
    }

    if (element == "0.000") {
        return true;
    }

    return false;
}

module.exports = service;