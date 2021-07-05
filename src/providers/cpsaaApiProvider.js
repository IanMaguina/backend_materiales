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
                data.resultado.TI_MATNR.forEach(element => {
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
                });
            }
        }
    }

    // if (data) {
    //     result.mensaje = data.mensaje;
    //     if (data.codigo === 1) {
    //         if (data.resultado !== '') {
    //             result.codigo = 1;
    //             data.resultado.TI_MATNR.forEach(element => {
    //                 const obj = {
    //                     material_codigo_modelo: element.MATNR,
    //                     ramo: element.MBRSH,
    //                     tipo_material: element.MTART,
    //                     grupo_articulo: element.MATKL,
    //                     sector: element.SPART
    //                 };

    //                 result.lista.push(obj);
    //             });
    //         }
    //     }
    // }

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
                data.resultado.TI_MATNR.forEach(element => {
                    const obj = {
                        material_codigo_modelo: element.MATNR,
                        ramo: element.MBRSH,
                        tipo_material: element.MTART,
                        grupo_articulo: element.MATKL,
                        sector: element.SPART
                    };

                    result.lista.push(obj);
                });
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

        ampliacion[element.id_material_solicitud] = { id_padre: 0 };

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

        var ti_solic = {
            SOL_PM: element.id_solicitud ? element.id_solicitud.toString() : "",
            DES_PM: element.nombre_solicitud ? element.nombre_solicitud.toString() : "",
            TIP_PM: "C", // 3	Tipo Solicitud	TIP_PM	“B” (Bloqueo)
            ESC_PM: element.escenario_nivel3 ? element.escenario_nivel3.toString() : "",
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
            LGRAD: element.nivel_servicio_pn2 ? element.nivel_servicio_pn2.toString() : "0.0",
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
            QPART: "89", // 88	Clase de inspección	QPART	-
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

        list_regla_vista.forEach(regla_vista => {
            if (regla_vista.id === enums.vista_portal.ventas && regla_vista.regla_vista === 'M') {
                ti_solic.V_VENT = "X"
            }
            else if (regla_vista.id === enums.vista_portal.compras /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_COMP = "X"
            }
            else if (regla_vista.id === enums.vista_portal.contabilidad /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_CONT = "X"
            }
            else if (regla_vista.id === enums.vista_portal.planif_necesi /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_PLAN = "X"
            }
            else if (regla_vista.id === enums.vista_portal.area_planificacion /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_MRP = "X"
            }
            else if (regla_vista.id === enums.vista_portal.prep_de_trabajo /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_PTRB = "X"
            }
            else if (regla_vista.id === enums.vista_portal.pronostico /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_PRON = "X"
            }
            else if (regla_vista.id === enums.vista_portal.gest_calidad /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_CALI = "X"
            }
            else if (regla_vista.id === enums.vista_portal.cal_coste /*&& regla_vista.regla_vista === 'M'*/) {
                ti_solic.V_CCOS = "X"
            }
        });

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
                LGRAD: element.nivel_servicio_pn2 ? element.nivel_servicio_pn2.toString() : "0.0",
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

module.exports = service;