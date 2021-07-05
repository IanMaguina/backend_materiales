const constantes = require('../utils/constantes');
const enums = require('../utils/enums');

const service = {};

//#region Funciones públicas
service.obtener = async (conn, id_material_solicitud) => {
    try {
        const query = obtenerScriptParaListar();
        const queryResponse = await conn.query((query + ' WHERE m.id = $1'), [id_material_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en materialSolicitudService.obtener. Details: " + error.stack;
        throw error;
    }
};

service.listar = async (conn, id_solicitud) => {
    try {
        const query = obtenerScriptParaListar();
        const queryResponse = await conn.query((query + ' WHERE m.id_solicitud = $1 ORDER BY m.id'), [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listar. Details: " + error.stack;
        throw error;
    }
};

service.listarPorSolicitudParaSAP = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT s.id \"id_solicitud\",  s.descripcion \"nombre_solicitud\", en3.codigo \"codigo_escenario_nivel3\", \
            ms.id \"id_material_solicitud\", ms.material_codigo_sap, ms.denominacion \"nombre_material\", ms.centro_codigo_sap, ms.almacen_codigo_sap, \
            ms.organizacion_ventas, ms.canal_distribucion, ms.ramo, ms.tipo_material, umb.codigo_sap \"unidad_medida_base\", \
            ms.grupo_articulo, ms.sector, ms.grupo_tipo_posicion_gral, ms.peso_bruto, ump.codigo_sap \"unidad_medida_peso\", \
            ms.codigo_ean, ms.partida_arancelaria, ms.verificacion_disponibilidad, ms.grupo_transporte, \
            ms.grupo_carga, ms.centro_beneficio_codigo_sap, ms.stock_negativo, ms.grupo_compra, ms.formula_concreto, ms.criticos, ms.estrategicos, \
            umv.codigo_sap \"unidad_medida_venta\", ms.grupo_estadistica_mat, ms.grupo_tipo_posicion, ms.grupo_imputacion_material, ms.jerarquia_producto, \
            ms.grupo_material1, ms.grupo_material2, uma.codigo_sap \"unidad_medida_almacen\", ms.ubicacion, ms.precio_estandar,  \
            ms.precio_variable, ms.categoria_valoracion, ms.control_precio, ms.determinacion_precio, ms.grupo_planif_necesidades, ms.tipo_mrp_caract_plani, \
            ms.planif_necesidades, ms.calculo_tamano_lote, ms.clase_aprovis, ms.aprovis_especial, ms.toma_retrograda, \
            ms.almacen_produccion, ms.alm_aprov_ext_pn2_almacen, ms.co_producto, ms.tiempo_fab_propia_pn2, ms.plaza_entrega_prev, \
            ms.clave_horizonte, ms.stock_seguridad_pn2, ms.stock_seguridad_min_pn2, ms.nivel_servicio_pn2, ms.indicador_periodo, \
            ms.grupo_estrategia, ms.planf_neces_mixtas, ms.individual_colectivo, ms.rechazo_componente, ms.sujeto_lote, \
            rcp.codigo_sap \"responsable_control_produccion\", pcf.codigo_sap \"perfil_control_fabricacion\", umf.codigo_sap \"unidad_medida_fabricacion\", \
            ms.limite_exceso_sum_ilimitado, ms.modelo_pronostico, ms.periodo_pasado, ms.periodo_pronostico, ms.limite_alarma, \
            ms.anular_automaticamente, ms.optimizacion_parametro, ms.estructura_cuantica, ms.origen_material, ms.tamano_lote, \
            am.nombre \"nombre_anexo\", am.ruta_anexo, ms.texto_compra, ms.texto_comercial, umc.codigo_sap \"unidad_medida_pedido\", \
            ms.inicializacion, ms.grado_optimizacion, ms.ind_ped_automa, ms.exceso_sum_ilimitado, ms.ump_var, ms.proc_sel_modelo, ms.ampliacion \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tescenario_nivel3 en3 ON en3.id = s.id_escenario_nivel3 \
            INNER JOIN dino.tmaterial_solicitud ms ON ms.id_solicitud = s.id \
            LEFT JOIN dino.tunidad_medida umb ON umb.id = ms.id_unidad_medida_base \
            LEFT JOIN dino.tunidad_medida ump ON ump.id = ms.id_unidad_medida_peso \
            LEFT JOIN dino.tunidad_medida umv ON umv.id = ms.id_unidad_medida_venta \
            LEFT JOIN dino.tunidad_medida umf ON umf.id = ms.id_unidad_medida_fabricacion \
            LEFT JOIN dino.tunidad_medida uma ON uma.id = ms.id_unidad_medida_almacen \
            LEFT JOIN dino.tunidad_medida umc ON umc.id = ms.id_unidad_medida_pedido \
            LEFT JOIN dino.tresponsable_control_produccion rcp ON rcp.id = ms.id_responsable_control_produccion \
            LEFT JOIN dino.tperfil_control_fabricacion pcf ON pcf.id = ms.id_perfil_control_fabricacion \
            LEFT JOIN dino.tanexo_material am ON am.id_material_solicitud = ms.id \
                AND am.id = (SELECT MAX(id) from dino.tanexo_material WHERE id_material_solicitud = ms.id) \
            WHERE s.id = $1 /*AND COALESCE(material_codigo_sap, '') = ''*/ \
            ORDER BY ms.id",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listar. Details: " + error.stack;
        throw error;
    }
};

service.listarPorDenominacion = async (conn, denominacion) => {
    try {
        const queryResponse = await conn.query(
            'SELECT ms.id "id_material_solicitud", denominacion, ms.centro_codigo_sap, ms.almacen_codigo_sap, ms.ampliacion \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tmaterial_solicitud ms ON ms.id_solicitud = s.id \
            WHERE UPPER(ms.denominacion) = upper($1)',
            [denominacion]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.listarPorDenominacionParaAmpliacion = async (conn, denominacion) => {
    try {
        const queryResponse = await conn.query(
            'SELECT ms.id "id_material_solicitud", \
            COALESCE(ms.denominacion, mb.denominacion) "denominacion", \
            COALESCE(ms.centro_codigo_sap, mb.centro_codigo_sap) "centro_codigo_sap", \
            COALESCE(ms.almacen_codigo_sap, mb.almacen_codigo_sap) "almacen_codigo_sap", \
            ms.ampliacion \
            FROM dino.tsolicitud s \
            INNER JOIN dino.tmaterial_solicitud ms ON ms.id_solicitud = s.id \
            INNER JOIN dino.tmaterial_solicitud_borrador mb ON mb.id_material_solicitud = ms.id \
            WHERE UPPER(COALESCE(ms.denominacion, mb.denominacion)) = upper($1) AND ms.Ampliacion = \'X\'',
            [denominacion]);
console.log(queryResponse.rows);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.listarPosiblesPadres = async (conn, id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap) => {
    try {
        const queryResponse = await conn.query(
            "SELECT * \
            FROM dino.tmaterial_solicitud ms \
            WHERE ms.id_solicitud = $1 \
            AND UPPER(ms.denominacion) = upper($2) \
            AND ms.centro_codigo_sap = $3 \
            AND ms.almacen_codigo_sap = $4 \
            AND COALESCE(ms.ampliacion, '') = ''",
            [id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap]);
        /*             AND ms.centro_codigo_sap <> $3 \
                    AND ms.almacen_codigo_sap <> $4 \
         */
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.listarHijos = async (conn, id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap) => {
    try {
        const queryResponse = await conn.query(
            "SELECT * \
            FROM dino.tmaterial_solicitud ms \
            WHERE ms.id_solicitud = $1 \
            AND ms.ampliacion = 'X' \
            AND UPPER(ms.denominacion) = upper($2) \
            AND ms.centro_codigo_sap = $3 \
            AND ms.almacen_codigo_sap = $4",
            [id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap]);
        /*             AND ms.centro_codigo_sap <> $3 \
                    AND ms.almacen_codigo_sap <> $4", */
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.listarHijosParaEliminar = async (conn, id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap) => {
    try {
        const queryResponse = await conn.query(
            "SELECT ms.id, ms.ampliacion, ms.denominacion, ms.centro_codigo_sap, ms.almacen_codigo_sap \
            FROM dino.tmaterial_solicitud ms \
            WHERE ms.id_solicitud = $1 AND ms.ampliacion = 'X' AND UPPER(ms.denominacion) = UPPER($2) \
            AND NOT(ms.centro_codigo_sap = $3 AND ms.almacen_codigo_sap = $4)",
            [id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.listarHijosPorIdMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "SELECT msh.id \
            FROM dino.tmaterial_solicitud msp \
            INNER JOIN dino.tmaterial_solicitud msh ON msh.id_solicitud = msp.id_solicitud \
            AND msh.denominacion = msp.denominacion \
            AND CONCAT(msh.centro_codigo_sap, msh.almacen_codigo_sap) <> CONCAT(msp.centro_codigo_sap, msp.almacen_codigo_sap) \
            AND msh.ampliacion = 'X' \
            WHERE msp.id = $1",
            [id_material_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarHijosPorIdMaterial. Details: " + error.stack;
        throw error;
    }
};

service.esPadre = async (conn, id_solicitud, denominacion) => {
    try {
        const queryResponse = await conn.query(
            "SELECT count(ampliacion)  FROM dino.tmaterial_solicitud ms \
            WHERE ms.id_solicitud = $1 \
            AND UPPER(ms.denominacion) = upper($2) \
            AND ms.ampliacion = 'X' ",
            [id_solicitud, denominacion]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarPorDenominacion. Details: " + error.stack;
        throw error;
    }
};

service.crear = async (conn, id_solicitud, material) => {
    try {
        const { columnas, valores } = obtenerScriptParaInsertar(material.campos, enums.tipo_tabla.original);
        console.log(columnas); console.log(valores);

        let query = "";
        if (columnas === constantes.emptyString || valores === constantes.emptyString) {
            query = "INSERT INTO dino.tmaterial_solicitud(id_solicitud) VALUES($1) RETURNING id";
        } else {
            query = "INSERT INTO dino.tmaterial_solicitud(id_solicitud, " + columnas.substring(0, columnas.length - 2) + ") \
                VALUES($1, " + valores.substring(0, valores.length - 2) + ") RETURNING id";
        }
        const result = await conn.query(
            query,
            [id_solicitud]);

        return result.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.crear. Detail: " + error.stack;
        throw error;
    }
};

service.crearAmpliacion = async (conn, material) => {
    try {
       
        const result = await conn.query(
            'INSERT INTO dino.tmaterial_solicitud (material_codigo_modelo, material_codigo_sap, ampliacion, peso_bruto, id_solicitud, id_unidad_medida_base, denominacion, id_grupo_tipo_posicion, id_verificacion_disponibilidad, id_grupo_transporte, id_grupo_carga, id_unidad_medida_peso, sector, formula_concreto, codigo_ean, tipo_ean, clasificacion_fiscal, id_unidad_medida_venta, stock_negativo, id_unidad_medida_pedido, precio_estandar, precio_variable, id_unidad_medida_almacen, id_tipo_mrp_caract_plani, id_calculo_tamano_lote, id_clase_aprovis, co_producto, tiempo_fab_propia_pn2, plaza_entrega_prev, stock_seguridad_pn2, stock_seguridad_min_pn2, nivel_servicio_pn2, id_indicador_periodo, id_grupo_estrategia, id_planf_neces_mixtas, id_individual_colectivo, rechazo_componente, sujeto_lote, id_unidad_medida_fabricacion, periodo_pasado, periodo_pronostico, id_inicializacion, limite_alarma, anular_automaticamente, optimizacion_parametro, estructura_cuantica, origen_material, tamano_lote, criticos, estrategicos, almacen_codigo_sap, centro_codigo_sap, centro_beneficio_codigo_sap, grupo_planif_necesidades, alm_aprov_ext_pn2_almacen, alm_aprov_ext_pn2_centro, almacen_produccion, almacen_produccion_centro, planif_necesidades, aprovis_especial, clave_horizonte, categoria_valoracion, grupo_imputacion_material, jerarquia_producto, grupo_tipo_posicion, tipo_mrp_caract_plani, calculo_tamano_lote, clase_aprovis, indicador_periodo, grupo_estrategia, planf_neces_mixtas, individual_colectivo, dcto_pronto_pago, ramo, ump_var, verificacion_disponibilidad, grupo_transporte, grupo_carga, idioma, grupo_tipo_posicion_gral, control_precio, modelo_pronostico, grupo_compra, determinacion_precio, grupo_estadistica_mat, grupo_material1, grupo_material2, partida_arancelaria, ubicacion, toma_retrograda, grupo_articulo, texto_comercial, texto_compra, mensaje_error_sap, canal_distribucion, cantidad_base, limite_exceso_sum_ilimitado, tipo_material, inicializacion, grado_optimizacion, proc_sel_modelo, id_responsable_control_produccion, id_perfil_control_fabricacion, organizacion_ventas, precio_base, moneda, ind_ped_automa, exceso_sum_ilimitado, existe_error_sap) \
            SELECT material_codigo_modelo, material_codigo_sap, $4, peso_bruto, id_solicitud, id_unidad_medida_base, denominacion, id_grupo_tipo_posicion, id_verificacion_disponibilidad, id_grupo_transporte, id_grupo_carga, id_unidad_medida_peso, sector, formula_concreto, codigo_ean, tipo_ean, clasificacion_fiscal, id_unidad_medida_venta, stock_negativo, id_unidad_medida_pedido, precio_estandar, precio_variable, id_unidad_medida_almacen, id_tipo_mrp_caract_plani, id_calculo_tamano_lote, id_clase_aprovis, co_producto, tiempo_fab_propia_pn2, plaza_entrega_prev, stock_seguridad_pn2, stock_seguridad_min_pn2, nivel_servicio_pn2, id_indicador_periodo, id_grupo_estrategia, id_planf_neces_mixtas, id_individual_colectivo, rechazo_componente, sujeto_lote, id_unidad_medida_fabricacion, periodo_pasado, periodo_pronostico, id_inicializacion, limite_alarma, anular_automaticamente, optimizacion_parametro, estructura_cuantica, origen_material, tamano_lote, criticos, estrategicos, $3, $2, centro_beneficio_codigo_sap, grupo_planif_necesidades, alm_aprov_ext_pn2_almacen, alm_aprov_ext_pn2_centro, almacen_produccion, almacen_produccion_centro, planif_necesidades, aprovis_especial, clave_horizonte, categoria_valoracion, grupo_imputacion_material, jerarquia_producto, grupo_tipo_posicion, tipo_mrp_caract_plani, calculo_tamano_lote, clase_aprovis, indicador_periodo, grupo_estrategia, planf_neces_mixtas, individual_colectivo, dcto_pronto_pago, ramo, ump_var, verificacion_disponibilidad, grupo_transporte, grupo_carga, idioma, grupo_tipo_posicion_gral, control_precio, modelo_pronostico, grupo_compra, determinacion_precio, grupo_estadistica_mat, grupo_material1, grupo_material2, partida_arancelaria, ubicacion, toma_retrograda, grupo_articulo, texto_comercial, texto_compra, mensaje_error_sap, canal_distribucion, cantidad_base, limite_exceso_sum_ilimitado, tipo_material, inicializacion, grado_optimizacion, proc_sel_modelo, id_responsable_control_produccion, id_perfil_control_fabricacion, organizacion_ventas, precio_base, moneda, ind_ped_automa, exceso_sum_ilimitado, existe_error_sap \
	        FROM dino.tmaterial_solicitud WHERE id = $1 \
            RETURNING id',
            [material.id, material.centro_codigo_sap, material.almacen_codigo_sap, "X"]);

        return result.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.crearAmpliacion. Detail: " + error.stack;
        throw error;
    }
};

service.crearBorrador = async (conn, id_solicitud, id_material_solicitud, material) => {
    try {
        const { columnas, valores } = obtenerScriptParaInsertar(material.campos, enums.tipo_tabla.borrador);
        console.log('arsa-->' + columnas); console.log('arsa valores-->' + valores);

        let query = "";
        if (columnas === constantes.emptyString || valores === constantes.emptyString) {
            query = "INSERT INTO dino.tmaterial_solicitud_borrador(id_solicitud, id_material_solicitud) \
            VALUES($1, $2) RETURNING id";
        } else {
            query = "INSERT INTO dino.tmaterial_solicitud_borrador(id_solicitud, id_material_solicitud, " + columnas.substring(0, columnas.length - 2) + ") \
        VALUES($1, $2, " + valores.substring(0, valores.length - 2) + ") RETURNING id";
        }

        const result = await conn.query(
            query,
            [id_solicitud, id_material_solicitud]);

        return result.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.agregarBorrador. Detail: " + error.stack;
        throw error;
    }
};

service.crearBorradorAmpliacion = async (conn, material, id_material_solicitud) => {
    try {
        const result = await conn.query(
            'INSERT INTO dino.tmaterial_solicitud_borrador (id_material_solicitud, id_solicitud, material_codigo_modelo, material_codigo_modelo_error, material_codigo_sap, material_codigo_sap_error, ampliacion, ampliacion_error, peso_bruto, peso_bruto_error, unidad_medida_base, unidad_medida_base_error, denominacion, denominacion_error, tipo_material, tipo_material_error, ramo, ramo_error, grupo_articulo, grupo_articulo_error, partida_arancelaria, partida_arancelaria_error, organizacion_ventas, organizacion_ventas_error, canal_distribucion, canal_distribucion_error, grupo_tipo_posicion, grupo_tipo_posicion_error, grupo_material1, grupo_material1_error, grupo_material2, grupo_material2_error, verificacion_disponibilidad, verificacion_disponibilidad_error, grupo_transporte, grupo_transporte_error, grupo_carga, grupo_carga_error, unidad_medida_peso, unidad_medida_peso_error, sector, sector_error, grupo_tipo_posicion_gral, grupo_tipo_posicion_gral_error, formula_concreto, formula_concreto_error, codigo_ean, codigo_ean_error, tipo_ean, tipo_ean_error, clasificacion_fiscal, clasificacion_fiscal_error, unidad_medida_venta, unidad_medida_venta_error, grupo_estadistica_mat, grupo_estadistica_mat_error, stock_negativo, stock_negativo_error, grupo_compra, grupo_compra_error, unidad_medida_pedido, unidad_medida_pedido_error, precio_variable, precio_variable_error, control_precio, control_precio_error, determinacion_precio, determinacion_precio_error, unidad_medida_almacen, unidad_medida_almacen_error, tipo_mrp_caract_plani, tipo_mrp_caract_plani_error, calculo_tamano_lote, calculo_tamano_lote_error, clase_aprovis, clase_aprovis_error, toma_retrograda, toma_retrograda_error, co_producto, co_producto_error, tiempo_fab_propia_pn2, tiempo_fab_propia_pn2_error, plaza_entrega_prev, plaza_entrega_prev_error, stock_seguridad_pn2, stock_seguridad_pn2_error, stock_seguridad_min_pn2, stock_seguridad_min_pn2_error, nivel_servicio_pn2, nivel_servicio_pn2_error, indicador_periodo, indicador_periodo_error, grupo_estrategia, grupo_estrategia_error, planf_neces_mixtas, planf_neces_mixtas_error, individual_colectivo, individual_colectivo_error, rechazo_componente, rechazo_componente_error, sujeto_lote, sujeto_lote_error, unidad_medida_fabricacion, unidad_medida_fabricacion_error, limite_exceso_sum_ilimitado_error, modelo_pronostico, modelo_pronostico_error, periodo_pasado, periodo_pasado_error, periodo_pronostico, periodo_pronostico_error, inicializacion, inicializacion_error, limite_alarma, limite_alarma_error, grado_optimizacion, grado_optimizacion_error, proc_sel_modelo, proc_sel_modelo_error, anular_automaticamente, anular_automaticamente_error, optimizacion_parametro, optimizacion_parametro_error, estructura_cuantica, estructura_cuantica_error, origen_material, origen_material_error, tamano_lote, tamano_lote_error, criticos, criticos_error, estrategicos, estrategicos_error, almacen_codigo_sap, almacen_codigo_sap_error, centro_codigo_sap_error, centro_beneficio_codigo_sap, centro_beneficio_codigo_sap_error, grupo_planif_necesidades, grupo_planif_necesidades_error, alm_aprov_ext_pn2_almacen, alm_aprov_ext_pn2_almacen_error, alm_aprov_ext_pn2_centro, alm_aprov_ext_pn2_centro_error, almacen_produccion, almacen_produccion_error, almacen_produccion_centro, almacen_produccion_centro_error, planif_necesidades, planif_necesidades_error, aprovis_especial, aprovis_especial_error, clave_horizonte, clave_horizonte_error, responsable_control_produccion, responsable_control_produccion_error, perfil_control_fabricacion, perfil_control_fabricacion_error, categoria_valoracion, categoria_valoracion_error, grupo_imputacion_material, grupo_imputacion_material_error, jerarquia_producto, jerarquia_producto_error, centro_codigo_sap, limite_exceso_sum_ilimitado, dcto_pronto_pago, dcto_pronto_pago_error, ump_var, ump_var_error, idioma, idioma_error, precio_estandar, precio_estandar_error, ubicacion, ubicacion_error, texto_comercial, texto_comercial_error, texto_compra, texto_compra_error, cantidad_base, cantidad_base_error, precio_base, precio_base_error, moneda, moneda_error, ind_ped_automa, ind_ped_automa_error, exceso_sum_ilimitado, exceso_sum_ilimitado_error) \
            SELECT $1, id_solicitud, material_codigo_modelo, material_codigo_modelo_error, material_codigo_sap, material_codigo_sap_error, $5, false, peso_bruto, peso_bruto_error, unidad_medida_base, unidad_medida_base_error, denominacion, denominacion_error, tipo_material, tipo_material_error, ramo, ramo_error, grupo_articulo, grupo_articulo_error, partida_arancelaria, partida_arancelaria_error, organizacion_ventas, organizacion_ventas_error, canal_distribucion, canal_distribucion_error, grupo_tipo_posicion, grupo_tipo_posicion_error, grupo_material1, grupo_material1_error, grupo_material2, grupo_material2_error, verificacion_disponibilidad, verificacion_disponibilidad_error, grupo_transporte, grupo_transporte_error, grupo_carga, grupo_carga_error, unidad_medida_peso, unidad_medida_peso_error, sector, sector_error, grupo_tipo_posicion_gral, grupo_tipo_posicion_gral_error, formula_concreto, formula_concreto_error, codigo_ean, codigo_ean_error, tipo_ean, tipo_ean_error, clasificacion_fiscal, clasificacion_fiscal_error, unidad_medida_venta, unidad_medida_venta_error, grupo_estadistica_mat, grupo_estadistica_mat_error, stock_negativo, stock_negativo_error, grupo_compra, grupo_compra_error, unidad_medida_pedido, unidad_medida_pedido_error, precio_variable, precio_variable_error, control_precio, control_precio_error, determinacion_precio, determinacion_precio_error, unidad_medida_almacen, unidad_medida_almacen_error, tipo_mrp_caract_plani, tipo_mrp_caract_plani_error, calculo_tamano_lote, calculo_tamano_lote_error, clase_aprovis, clase_aprovis_error, toma_retrograda, toma_retrograda_error, co_producto, co_producto_error, tiempo_fab_propia_pn2, tiempo_fab_propia_pn2_error, plaza_entrega_prev, plaza_entrega_prev_error, stock_seguridad_pn2, stock_seguridad_pn2_error, stock_seguridad_min_pn2, stock_seguridad_min_pn2_error, nivel_servicio_pn2, nivel_servicio_pn2_error, indicador_periodo, indicador_periodo_error, grupo_estrategia, grupo_estrategia_error, planf_neces_mixtas, planf_neces_mixtas_error, individual_colectivo, individual_colectivo_error, rechazo_componente, rechazo_componente_error, sujeto_lote, sujeto_lote_error, unidad_medida_fabricacion, unidad_medida_fabricacion_error, limite_exceso_sum_ilimitado_error, modelo_pronostico, modelo_pronostico_error, periodo_pasado, periodo_pasado_error, periodo_pronostico, periodo_pronostico_error, inicializacion, inicializacion_error, limite_alarma, limite_alarma_error, grado_optimizacion, grado_optimizacion_error, proc_sel_modelo, proc_sel_modelo_error, anular_automaticamente, anular_automaticamente_error, optimizacion_parametro, optimizacion_parametro_error, estructura_cuantica, estructura_cuantica_error, origen_material, origen_material_error, tamano_lote, tamano_lote_error, criticos, criticos_error, estrategicos, estrategicos_error, $4, false, false, centro_beneficio_codigo_sap, centro_beneficio_codigo_sap_error, grupo_planif_necesidades, grupo_planif_necesidades_error, alm_aprov_ext_pn2_almacen, alm_aprov_ext_pn2_almacen_error, alm_aprov_ext_pn2_centro, alm_aprov_ext_pn2_centro_error, almacen_produccion, almacen_produccion_error, almacen_produccion_centro, almacen_produccion_centro_error, planif_necesidades, planif_necesidades_error, aprovis_especial, aprovis_especial_error, clave_horizonte, clave_horizonte_error, responsable_control_produccion, responsable_control_produccion_error, perfil_control_fabricacion, perfil_control_fabricacion_error, categoria_valoracion, categoria_valoracion_error, grupo_imputacion_material, grupo_imputacion_material_error, jerarquia_producto, jerarquia_producto_error, $3, limite_exceso_sum_ilimitado, dcto_pronto_pago, dcto_pronto_pago_error, ump_var, ump_var_error, idioma, idioma_error, precio_estandar, precio_estandar_error, ubicacion, ubicacion_error, texto_comercial, texto_comercial_error, texto_compra, texto_compra_error, cantidad_base, cantidad_base_error, precio_base, precio_base_error, moneda, moneda_error, ind_ped_automa, ind_ped_automa_error, exceso_sum_ilimitado, exceso_sum_ilimitado_error \
	        FROM dino.tmaterial_solicitud_borrador WHERE id_material_solicitud = $2 \
            RETURNING id',
            [id_material_solicitud, material.id, material.centro_codigo_sap, material.almacen_codigo_sap, "X"]);

        return result.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.crearBorradorAmpliacion. Detail: " + error.stack;
        throw error;
    }
};

service.actualizar = async (conn, id_material_solicitud, material) => {
    try {

        const script = obtenerScriptParaActualizar(material.campos, enums.tipo_tabla.original);
        console.log(script);

        if (script && script !== constantes.emptyString) {
            const query = "UPDATE dino.tmaterial_solicitud SET " + script.substring(0, script.length - 2) +
                " WHERE id = $1";

            const result = await conn.query(
                query,
                [id_material_solicitud]);

            return result.rows;
        }

        return null;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.actualizar. Detail: " + error.stack;
        throw error;
    }
};

service.actualizarBorrador = async (conn, id_material_solicitud, material) => {
    try {
        const script = obtenerScriptParaActualizar(material.campos, enums.tipo_tabla.borrador);
        console.log(script);

        if (script && script !== constantes.emptyString) {
            const query = "UPDATE dino.tmaterial_solicitud_borrador SET " + script.substring(0, script.length - 2) +
                " WHERE id_material_solicitud = $1";

            const result = await conn.query(
                query,
                [id_material_solicitud]);

            return result.rows;
        }

        return null;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.actualizarBorrador. Detail: " + error.stack;
        throw error;
    }
};

service.eliminarBorradorPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tmaterial_solicitud_borrador \
            WHERE id_material_solicitud IN (SELECT id FROM dino.tmaterial_solicitud WHERE id_solicitud = $1)",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.eliminarBorradorPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.eliminarPorSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tmaterial_solicitud \
            WHERE id_solicitud = $1",
            [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.eliminarPorSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.eliminarBorradorPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tmaterial_solicitud_borrador \
            WHERE id_material_solicitud = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.eliminarBorradorPorMaterial. Details: " + error.stack;
        throw error;
    }
};

service.eliminarPorMaterial = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            "DELETE FROM dino.tmaterial_solicitud \
            WHERE id = $1",
            [id_material_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.eliminarPorMaterial. Details: " + error.stack;
        throw error;
    }
};

service.obtenerParaValidar = async (conn, id_material_solicitud) => {
    try {
        const queryResponse = await conn.query(
            'SELECT \
                b.centro_codigo_sap, b.centro_codigo_sap_error, \
                m.almacen_codigo_sap, m.denominacion, m.ampliacion \
            FROM dino.tmaterial_solicitud m \
            INNER JOIN dino.tmaterial_solicitud_borrador b on b.id_material_solicitud = m.id \
            WHERE m.id = $1', [id_material_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en materialSolicitudService.obtenerParaValidar. Details: " + error.stack;
        throw error;
    }
};

service.obtenerParaEliminar = async (conn, id_material_solicitud) => {
    try {
        console.log(id_material_solicitud);
        const queryResponse = await conn.query(
            'SELECT m.id_solicitud, m.id, m.centro_codigo_sap, m.almacen_codigo_sap, m.denominacion, m.ampliacion FROM dino.tmaterial_solicitud m WHERE m.id = $1', [id_material_solicitud]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en materialSolicitudService.obtenerParaEliminar. Details: " + error.stack;
        throw error;
    }
};

service.actualizarPorRespuestaSapCreacionSolicitud = async (conn, materialSolicitud) => {
    try {
        const queryResponse = await conn.query(
            "UPDATE dino.tmaterial_solicitud \
            SET material_codigo_sap = $1, \
            mensaje_error_sap = $2, \
            existe_error_sap = $3 \
            WHERE id = $4"
            , [materialSolicitud.material_codigo_sap,
            materialSolicitud.mensaje_error_sap,
            materialSolicitud.existe_error_sap,
            materialSolicitud.id]);
        if (queryResponse && queryResponse.rowCount == 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.actualizarPorRespuestaSapCreacionSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.listaParaFinalizarSolicitud = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT id, material_codigo_sap, mensaje_error_sap FROM dino.tmaterial_solicitud WHERE id_solicitud=$1", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listaParaFinalizarSolicitud. Details: " + error.stack;
        throw error;
    }
};

service.listarParaNotificarRechazo = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query("SELECT denominacion FROM dino.tmaterial_solicitud WHERE id_solicitud=$1", [id_solicitud]);
        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarParaNotificarRechazo. Details: " + error.stack;
        throw error;
    }
};

service.listarIdMaterialesParaValidar = async (conn, id_solicitud, id_materiales) => {
    try {
        const queryResponse = await conn.query(
            "SELECT id FROM dino.tmaterial_solicitud \
            WHERE id_solicitud = $1 AND id IN (" + id_materiales.join() + ")", [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarIdMaterialesParaValidar. Details: " + error.stack;
        throw error;
    }
};

service.listarMaterialesParaValidarAmpliacion = async (conn, id_solicitud) => {
    try {
        const queryResponse = await conn.query(
            'SELECT id_material_solicitud, \
            COALESCE(m.denominacion, b.denominacion) "denominacion", denominacion_error, \
            COALESCE(m.centro_codigo_sap, b.centro_codigo_sap) "centro_codigo_sap", centro_codigo_sap_error, \
            COALESCE(m.almacen_codigo_sap, b.almacen_codigo_sap) "almacen_codigo_sap", almacen_codigo_sap_error, \
            COALESCE(m.ampliacion, b.ampliacion) "ampliacion", ampliacion_error \
            FROM dino.tmaterial_solicitud m \
            INNER JOIN dino.tmaterial_solicitud_borrador b ON b.id_material_solicitud = m.id \
            WHERE m.id_solicitud = $1 \
            ORDER BY id_material_solicitud', [id_solicitud]);

        return queryResponse.rows;
    } catch (error) {
        error.stack = "\nError en materialSolicitudService.listarMaterialesParaValidarAmpliacion. Details: " + error.stack;
        throw error;
    }
};

service.obtenerPorCodigoSap = async (conn, material_codigo_sap) => {
    try {
        const queryResponse = await conn.query(
            'SELECT m.id, m.centro_codigo_sap, m.almacen_codigo_sap, m.id_solicitud \
            FROM dino.tmaterial_solicitud m \
            WHERE m.material_codigo_sap = $1', [material_codigo_sap]);

        if (queryResponse.rows.length > 0) {
            return queryResponse.rows[0];
        } else {
            return null;
        }

    } catch (error) {
        error.stack = "\nError en materialSolicitudService.obtenerPorCodigoSap. Details: " + error.stack;
        throw error;
    }
};
//#endregion

//#region Funciones privadas
function obtenerScriptParaListar() {
    const script = 'SELECT m.id "id_material_solicitud", m.material_codigo_modelo, m.material_codigo_sap, \
    m.ramo, b.ramo "ramo_borrador", b.ramo_error, r.nombre "ramo_descripcion", \
    m.denominacion, b.denominacion "denominacion_borrador", b.denominacion_error,  \
    m.id_unidad_medida_base, b.unidad_medida_base, b.unidad_medida_base_error, umb.nombre "unidad_medida_base_descripcion", \
    m.peso_bruto, b.peso_bruto "peso_bruto_borrador", b.peso_bruto_error, \
    m.id_unidad_medida_peso, b.unidad_medida_peso, b.unidad_medida_peso_error, ump.nombre "unidad_medida_peso_descripcion", \
    m.partida_arancelaria, b.partida_arancelaria "partida_arancelaria_borrador", b.partida_arancelaria_error, pa.nombre "partida_arancelaria_descripcion", \
    m.centro_codigo_sap, b.centro_codigo_sap "centro_codigo_sap_borrador", b.centro_codigo_sap_error, c.nombre "centro_descripcion", \
    m.centro_beneficio_codigo_sap, b.centro_beneficio_codigo_sap "centro_beneficio_codigo_sap_borrador", b.centro_beneficio_codigo_sap_error, cb.nombre "centro_beneficio_descripcion", \
    m.almacen_codigo_sap, b.almacen_codigo_sap "almacen_codigo_sap_borrador", b.almacen_codigo_sap_error, a.nombre "almacen_descripcion", \
    m.organizacion_ventas, b.organizacion_ventas "organizacion_ventas_borrador", b.organizacion_ventas_error, ov.nombre "organizacion_ventas_descripcion", \
    m.canal_distribucion, b.canal_distribucion "canal_distribucion_borrador", b.canal_distribucion_error, cd.nombre "canal_distribucion_descripcion", \
    m.tipo_material, b.tipo_material "tipo_material_borrador", b.tipo_material_error, tm.nombre "tipo_material_descripcion", \
    m.grupo_articulo, b.grupo_articulo "grupo_articulo_borrador", b.grupo_articulo_error, ga.nombre "grupo_articulo_descripcion", \
    m.sector, b.sector "sector_borrador", b.sector_error, \
    m.grupo_tipo_posicion_gral, b.grupo_tipo_posicion_gral "grupo_tipo_posicion_gral_borrador", b.grupo_tipo_posicion_gral_error, gtpg.nombre "grupo_tipo_posicion_gral_descripcion", \
    m.codigo_ean, b.codigo_ean "codigo_ean_borrador", b.codigo_ean_error,  \
    m.tipo_ean, b.tipo_ean "tipo_ean_borrador", b.tipo_ean_error,  \
    m.texto_compra, b.texto_compra "texto_compra_borrador", b.texto_compra_error, \
    m.clasificacion_fiscal, b.clasificacion_fiscal "clasificacion_fiscal_borrador", b.clasificacion_fiscal_error, \
    m.id_unidad_medida_venta, b.unidad_medida_venta, b.unidad_medida_venta_error, umv.nombre "unidad_medida_venta_descripcion", \
    m.grupo_estadistica_mat, b.grupo_estadistica_mat "grupo_estadistica_mat_borrador", b.grupo_estadistica_mat_error, gem.nombre "grupo_estadistica_mat_descripcion", \
    m.grupo_tipo_posicion, b.grupo_tipo_posicion "grupo_tipo_posicion_borrador", b.grupo_tipo_posicion_error, gtp.nombre "grupo_tipo_posicion_descripcion", \
    m.grupo_imputacion_material, b.grupo_imputacion_material "grupo_imputacion_material_borrador", b.grupo_imputacion_material_error, gim.nombre "grupo_imputacion_material_descripcion", \
    m.jerarquia_producto, b.jerarquia_producto "jerarquia_producto_borrador", b.jerarquia_producto_error, jp.nombre "jerarquia_producto_descripcion", \
    m.grupo_material1, b.grupo_material1 "grupo_material1_borrador", b.grupo_material1_error, gm1.nombre "grupo_material1_descripcion", \
    m.grupo_material2, b.grupo_material2 "grupo_material2_borrador", b.grupo_material2_error, gm2.nombre "grupo_material2_descripcion", \
    m.texto_comercial, b.texto_comercial "texto_comercial_borrador", b.texto_comercial_error, \
    m.verificacion_disponibilidad, b.verificacion_disponibilidad "verificacion_disponibilidad_borrador", b.verificacion_disponibilidad_error, vd.nombre "verificacion_disponibilidad_descripcion", \
    m.grupo_transporte, b.grupo_transporte "grupo_transporte_borrador", b.grupo_transporte_error, gt.nombre "grupo_transporte_descripcion", \
    m.grupo_carga, b.grupo_carga "grupo_carga_borrador", b.grupo_carga_error, gc.nombre "grupo_carga_descripcion", \
    m.stock_negativo, b.stock_negativo "stock_negativo_borrador", b.stock_negativo_error, \
    m.formula_concreto, b.formula_concreto "formula_concreto_borrador", b.formula_concreto_error, \
    m.grupo_compra, b.grupo_compra "grupo_compra_borrador", b.grupo_compra_error, gc.nombre "grupo_compra_descripcion", \
    m.id_unidad_medida_pedido, b.unidad_medida_pedido, b.unidad_medida_pedido_error, umpd.nombre "unidad_medida_pedido_descripcion", \
    m.precio_estandar, b.precio_estandar "precio_estandar_borrador", b.precio_estandar_error, \
    m.precio_variable, b.precio_variable "precio_variable_borrador", b.precio_variable_error, \
    m.categoria_valoracion, b.categoria_valoracion "categoria_valoracion_borrador", b.categoria_valoracion_error, cv.nombre "categoria_valoracion_descripcion", \
    m.control_precio, b.control_precio "control_precio_borrador", b.control_precio_error, cp.nombre "control_precio_descripcion", \
    m.determinacion_precio, b.determinacion_precio "determinacion_precio_borrador", b.determinacion_precio_error, dp.nombre "determinacion_precio_descripcion", \
    m.id_unidad_medida_almacen, b.unidad_medida_almacen, b.unidad_medida_almacen_error, uma.nombre "unidad_medida_almacen_descripcion", \
    m.ubicacion, b.ubicacion "ubicacion_borrador", b.ubicacion_error, \
    m.dcto_pronto_pago, b.dcto_pronto_pago "dcto_pronto_pago_borrador", b.dcto_pronto_pago_error, \
    m.grupo_planif_necesidades, b.grupo_planif_necesidades "grupo_planif_necesidades_borrador", b.grupo_planif_necesidades_error, gpn.nombre "grupo_planif_necesidades_descripcion", \
    m.tipo_mrp_caract_plani, b.tipo_mrp_caract_plani "tipo_mrp_caract_plani_borrador", b.tipo_mrp_caract_plani_error, tmcp.nombre "tipo_mrp_caract_plani_descripcion", \
    m.planif_necesidades, b.planif_necesidades "planif_necesidades_borrador", b.planif_necesidades_error, pn.nombre "planif_necesidades_descripcion", \
    m.calculo_tamano_lote, b.calculo_tamano_lote "calculo_tamano_lote_borrador", b.calculo_tamano_lote_error, ctl.nombre "calculo_tamano_lote_descripcion", \
    m.clase_aprovis, b.clase_aprovis "clase_aprovis_borrador", b.clase_aprovis_error, ca.descripcion "clase_aprovis_descripcion", \
    m.aprovis_especial, b.aprovis_especial "aprovis_especial_borrador", b.aprovis_especial_error, ae.nombre "aprovis_especial_descripcion", \
    m.toma_retrograda, b.toma_retrograda "toma_retrograda_borrador", b.toma_retrograda_error, tr.nombre "toma_retrograda_descripcion", \
    m.almacen_produccion, b.almacen_produccion "almacen_produccion_borrador", b.almacen_produccion_error, ap.nombre "almacen_produccion_descripcion", \
    \
    m.co_producto, b.co_producto "co_producto_borrador", b.co_producto_error, \
    m.tiempo_fab_propia_pn2, b.tiempo_fab_propia_pn2 "tiempo_fab_propia_pn2_borrador", b.tiempo_fab_propia_pn2_error, \
    m.plaza_entrega_prev, b.plaza_entrega_prev "plaza_entrega_prev_borrador", b.plaza_entrega_prev_error, \
    m.clave_horizonte, b.clave_horizonte "clave_horizonte_borrador", b.clave_horizonte_error, ch.nombre "clave_horizonte_descripcion", \
    m.stock_seguridad_pn2, b.stock_seguridad_pn2 "stock_seguridad_pn2_borrador", b.stock_seguridad_pn2_error, \
    m.stock_seguridad_min_pn2, b.stock_seguridad_min_pn2 "stock_seguridad_min_pn2_borrador", b.stock_seguridad_min_pn2_error, \
    m.nivel_servicio_pn2, b.nivel_servicio_pn2 "nivel_servicio_pn2_borrador", b.nivel_servicio_pn2_error, \
    m.indicador_periodo, b.indicador_periodo "indicador_periodo_borrador", b.indicador_periodo_error, ip.nombre "indicador_periodo_descripcion", \
    m.grupo_estrategia, b.grupo_estrategia "grupo_estrategia_borrador", b.grupo_estrategia_error, ge.nombre "grupo_estrategia_descripcion", \
    m.planf_neces_mixtas, b.planf_neces_mixtas "planf_neces_mixtas_borrador", b.planf_neces_mixtas_error, pnm.nombre "planf_neces_mixtas_descripcion", \
    m.individual_colectivo, b.individual_colectivo "individual_colectivo_borrador", b.individual_colectivo_error, ic.nombre "individual_colectivo_descripcion", \
    m.rechazo_componente, b.rechazo_componente "rechazo_componente_borrador", b.rechazo_componente_error, \
    m.sujeto_lote, b.sujeto_lote "sujeto_lote_borrador", b.sujeto_lote_error, \
    m.id_responsable_control_produccion, b.responsable_control_produccion, b.responsable_control_produccion_error, rcp.nombre "responsable_control_produccion_descripcion", \
    m.id_perfil_control_fabricacion, b.perfil_control_fabricacion, b.perfil_control_fabricacion_error, pcf.nombre "perfil_control_fabricacion_descripcion", \
    m.id_unidad_medida_fabricacion, b.unidad_medida_fabricacion, b.unidad_medida_fabricacion_error, umf.nombre "unidad_medida_fabricacion_descripcion", \
    m.limite_exceso_sum_ilimitado, b.limite_exceso_sum_ilimitado "limite_exceso_sum_ilimitado_borrador", b.limite_exceso_sum_ilimitado_error, \
    m.modelo_pronostico, b.modelo_pronostico "modelo_pronostico_borrador", b.modelo_pronostico_error, mp.nombre "modelo_pronostico_descripcion", \
    m.periodo_pasado, b.periodo_pasado "periodo_pasado_borrador", b.periodo_pasado_error, \
    m.periodo_pronostico, b.periodo_pronostico "periodo_pronostico_borrador", b.periodo_pronostico_error, \
    m.inicializacion, b.inicializacion "inicializacion_borrador", b.inicializacion_error, \
    m.limite_alarma, b.limite_alarma "limite_alarma_borrador", b.limite_alarma_error, \
    m.grado_optimizacion, b.grado_optimizacion "grado_optimizacion_borrador", b.grado_optimizacion_error, \
    m.proc_sel_modelo, b.proc_sel_modelo "proc_sel_modelo_borrador", b.proc_sel_modelo_error, \
    m.estructura_cuantica, b.estructura_cuantica "estructura_cuantica_borrador", b.estructura_cuantica_error, \
    m.origen_material, b.origen_material "origen_material_borrador", b.origen_material_error, \
    m.tamano_lote, b.tamano_lote "tamano_lote_borrador", b.tamano_lote_error, \
    m.criticos, b.criticos "criticos_borrador", b.criticos_error, \
    m.estrategicos, b.estrategicos "estrategicos_borrador", b.estrategicos_error, \
    m.ump_var, b.ump_var "ump_var_borrador", b.ump_var_error, \
    m.cantidad_base, b.cantidad_base "cantidad_base_borrador", b.cantidad_base_error, \
    m.idioma, b.idioma "idioma_borrador", b.idioma_error, i.nombre "idioma_descripcion", \
    m.ampliacion, b.ampliacion "ampliacion_borrador", b.ampliacion_error, \
    m.precio_base, b.precio_base "precio_base_borrador", b.precio_base_error, \
    m.moneda, b.moneda "moneda_borrador", b.moneda_error, \
    m.ind_ped_automa, b.ind_ped_automa "ind_ped_automa_borrador", b.ind_ped_automa_error, \
    m.exceso_sum_ilimitado, b.exceso_sum_ilimitado "exceso_sum_ilimitado_borrador", b.exceso_sum_ilimitado_error, \
    mensaje_error_sap, existe_error_sap \
    FROM dino.tmaterial_solicitud m \
    INNER JOIN dino.tmaterial_solicitud_borrador b on b.id_material_solicitud = m.id \
    LEFT JOIN dino.tramo r ON r.codigo_sap = m.ramo \
    LEFT JOIN dino.tunidad_medida umb ON umb.id = m.id_unidad_medida_base \
    LEFT JOIN dino.tunidad_medida ump ON ump.id = m.id_unidad_medida_peso \
    LEFT JOIN dino.tunidad_medida umv ON umv.id = m.id_unidad_medida_venta \
    LEFT JOIN dino.tunidad_medida umpd ON umpd.id = m.id_unidad_medida_pedido \
    LEFT JOIN dino.tunidad_medida uma ON uma.id = m.id_unidad_medida_almacen \
    LEFT JOIN dino.tunidad_medida umf ON umf.id = m.id_unidad_medida_fabricacion \
    LEFT JOIN dino.tpartida_arancelaria pa ON pa.codigo_sap = m.partida_arancelaria \
    LEFT JOIN dino.tcentro c ON c.codigo_sap = m.centro_codigo_sap \
    LEFT JOIN dino.tcentro_beneficio cb ON cb.codigo_sap = m.centro_beneficio_codigo_sap \
    LEFT JOIN dino.talmacen a ON a.codigo_sap = m.almacen_codigo_sap AND a.centro_codigo_sap = m.centro_codigo_sap \
    LEFT JOIN dino.tgrupo_estadistica_mat gem ON gem.codigo_sap = m.grupo_estadistica_mat \
    LEFT JOIN dino.tgrupo_imputacion_material gim ON gim.codigo_sap = m.grupo_imputacion_material \
    LEFT JOIN dino.tjerarquia_producto jp ON jp.codigo_sap = m.jerarquia_producto \
    LEFT JOIN dino.tgrupo_material1 gm1 ON gm1.codigo_sap = m.grupo_material1 \
    LEFT JOIN dino.tgrupo_material2 gm2 ON gm2.codigo_sap = m.grupo_material2 \
    LEFT JOIN dino.tgrupo_transporte gt ON gt.codigo_sap = m.grupo_transporte \
    LEFT JOIN dino.tgrupo_carga gc ON gc.codigo_sap = m.grupo_carga \
    LEFT JOIN dino.tcategoria_valoracion cv ON cv.codigo_sap = m.categoria_valoracion \
    LEFT JOIN dino.tresponsable_control_produccion rcp ON rcp.id = m.id_responsable_control_produccion \
    LEFT JOIN dino.tperfil_control_fabricacion pcf ON pcf.id = m.id_perfil_control_fabricacion \
    LEFT JOIN dino.tidioma i ON i.codigo_sap = m.idioma \
    LEFT JOIN dino.tgrupo_tipo_posicion gtp ON gtp.codigo_sap = m.grupo_tipo_posicion \
    LEFT JOIN dino.tverificacion_disponibilidad vd ON vd.codigo_sap = m.verificacion_disponibilidad \
    LEFT JOIN dino.ttipo_material tm ON tm.codigo_sap = m.tipo_material \
    LEFT JOIN dino.tgrupo_articulo ga ON ga.codigo_sap = m.grupo_articulo \
    LEFT JOIN dino.torganizacion_ventas ov ON ov.codigo_sap = m.organizacion_ventas \
    LEFT JOIN dino.tcanal_distribucion cd ON cd.codigo_sap = m.canal_distribucion \
    LEFT JOIN dino.tgrupo_tipo_posicion gtpg ON gtpg.codigo_sap = m.grupo_tipo_posicion_gral \
    LEFT JOIN dino.tgrupo_planif_necesidades gpn ON gpn.codigo_sap = m.grupo_planif_necesidades \
    LEFT JOIN dino.tplanif_necesidades pn ON pn.codigo_sap = m.planif_necesidades and pn.centro_codigo_sap = m.centro_codigo_sap \
    LEFT JOIN dino.tcalculo_tamano_lote ctl ON ctl.codigo_sap = m.calculo_tamano_lote \
    LEFT JOIN dino.tgrupo_compra gco ON gco.codigo_sap = m.grupo_compra \
    LEFT JOIN dino.tcontrol_precio cp ON cp.codigo_sap = m.control_precio \
    LEFT JOIN dino.tdeterminacion_precio dp ON dp.codigo_sap = m.determinacion_precio \
    LEFT JOIN dino.ttipo_mrp_caract_plani tmcp ON tmcp.codigo_sap = m.tipo_mrp_caract_plani \
    LEFT JOIN dino.tclase_aprovis ca ON ca.codigo_sap = m.clase_aprovis \
    LEFT JOIN dino.ttoma_retrograda tr ON tr.codigo_sap = m.toma_retrograda \
    LEFT JOIN dino.tclave_horizonte ch ON ch.codigo_sap = m.clave_horizonte and ch.centro_codigo_sap = m.centro_codigo_sap  \
    LEFT JOIN dino.tindicador_periodo ip ON ip.codigo_sap = m.indicador_periodo \
    LEFT JOIN dino.tgrupo_estrategia ge ON ge.codigo_sap = m.grupo_estrategia \
    LEFT JOIN dino.tplanf_neces_mixtas pnm ON pnm.codigo_sap = m.planf_neces_mixtas \
    LEFT JOIN dino.tindividual_colectivo ic ON ic.codigo_sap = m.individual_colectivo \
    LEFT JOIN dino.taprovis_especial ae ON ae.codigo_sap = m.aprovis_especial \
    LEFT JOIN dino.talmacen ap ON ap.codigo_sap = m.almacen_produccion AND ap.centro_codigo_sap = m.centro_codigo_sap \
    LEFT JOIN dino.tmodelo_pronostico mp ON mp.codigo_sap = m.modelo_pronostico';

    return script;
};

function obtenerScriptParaInsertar(campos, tipo_tabla) {
    let script = { columnas: '', valores: '' };

    campos.forEach(campo => {
        switch (campo.codigo_interno) {
            case enums.codigo_interno.ramo: //[1]                
                script_insert_valor_texto(enums.codigo_interno.ramo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.denominacion: //[2]
                script_insert_valor_texto(enums.codigo_interno.denominacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_base: //[3]
                script_insert_id(enums.codigo_interno.unidad_medida_base, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.peso_bruto: //[4]
                script_insert_valor_texto(enums.codigo_interno.peso_bruto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_peso: //[5]
                script_insert_id(enums.codigo_interno.unidad_medida_peso, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.partida_arancelaria: //[6]
                script_insert_valor_texto(enums.codigo_interno.partida_arancelaria, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.centro_codigo_sap: //[7]
                script_insert_valor_texto(enums.codigo_interno.centro_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.centro_beneficio_codigo_sap: //[8]
                script_insert_valor_texto(enums.codigo_interno.centro_beneficio_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.almacen_codigo_sap: //[9]
                script_insert_valor_texto(enums.codigo_interno.almacen_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.organizacion_ventas: //[10]
                script_insert_valor_texto(enums.codigo_interno.organizacion_ventas, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.canal_distribucion: //[11]
                script_insert_valor_texto(enums.codigo_interno.canal_distribucion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.clasificacion_tab: //[12]
                break;
            case enums.codigo_interno.tipo_material: //[13]
                script_insert_valor_texto(enums.codigo_interno.tipo_material, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_articulo: //[14]
                script_insert_valor_texto(enums.codigo_interno.grupo_articulo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.sector: //[15]
                script_insert_valor_texto(enums.codigo_interno.sector, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_tipo_posicion_gral: //[16]
                script_insert_valor_texto(enums.codigo_interno.grupo_tipo_posicion_gral, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.codigo_ean: //[17]
                script_insert_valor_texto(enums.codigo_interno.codigo_ean, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tipo_ean: //[18]
                script_insert_valor_texto(enums.codigo_interno.tipo_ean, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.texto_compra: //[19 ]
                script_insert_valor_texto(enums.codigo_interno.texto_compra, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.link_adjunt: //[20]
                break
            case enums.codigo_interno.clasificacion_fiscal: //[21]
                script_insert_valor_texto(enums.codigo_interno.clasificacion_fiscal, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_venta: //[22]
                script_insert_id(enums.codigo_interno.unidad_medida_venta, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_estadistica_mat: //[23]
                script_insert_valor_texto(enums.codigo_interno.grupo_estadistica_mat, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_tipo_posicion: //[24]
                script_insert_valor_texto(enums.codigo_interno.grupo_tipo_posicion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_imputacion_material: //[25]
                script_insert_valor_texto(enums.codigo_interno.grupo_imputacion_material, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.jerarquia_producto: //[26]
                script_insert_valor_texto(enums.codigo_interno.jerarquia_producto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_material1: //[27]
                script_insert_valor_texto(enums.codigo_interno.grupo_material1, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_material2: //[28]
                script_insert_valor_texto(enums.codigo_interno.grupo_material2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.texto_comercial: //[29]
                script_insert_valor_texto(enums.codigo_interno.texto_comercial, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.verificacion_disponibilidad: //[30]
                script_insert_valor_texto(enums.codigo_interno.verificacion_disponibilidad, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_transporte: //31
                script_insert_valor_texto(enums.codigo_interno.grupo_transporte, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_carga: //32
                script_insert_valor_texto(enums.codigo_interno.grupo_carga, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.stock_negativo: //33
                script_insert_valor_texto(enums.codigo_interno.stock_negativo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.formula_concreto: //34
                script_insert_valor_texto(enums.codigo_interno.formula_concreto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_compra: //35
                script_insert_valor_texto(enums.codigo_interno.grupo_compra, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_pedido: //[36]
                script_insert_id(enums.codigo_interno.unidad_medida_pedido, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.precio_estandar: //37
                script_insert_valor_texto(enums.codigo_interno.precio_estandar, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.precio_variable: //38
                script_insert_valor_texto(enums.codigo_interno.precio_variable, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.categoria_valoracion: //39
                script_insert_valor_texto(enums.codigo_interno.categoria_valoracion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.control_precio: //[40]
                script_insert_valor_texto(enums.codigo_interno.control_precio, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.determinacion_precio: //41
                script_insert_valor_texto(enums.codigo_interno.determinacion_precio, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_almacen: //42
                script_insert_valor_texto(enums.codigo_interno.unidad_medida_almacen, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ubicacion: //[43]
                script_insert_valor_texto(enums.codigo_interno.ubicacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.dcto_pronto_pago: //44
                script_insert_valor_other(enums.codigo_interno.dcto_pronto_pago, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_planif_necesidades: //[45]
                script_insert_valor_texto(enums.codigo_interno.grupo_planif_necesidades, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tipo_mrp_caract_plani: //[46]
                script_insert_valor_texto(enums.codigo_interno.tipo_mrp_caract_plani, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.planif_necesidades: //[47]
                script_insert_valor_texto(enums.codigo_interno.planif_necesidades, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.calculo_tamano_lote: //[48]
                script_insert_valor_texto(enums.codigo_interno.calculo_tamano_lote, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.area_planificacion_tab: //49
                console.log("script_insert: Not implemented " + enums.codigo_interno.area_planificacion_tab);
                break;
            case enums.codigo_interno.grupo_planif_necesidades_tab: //50
                console.log("script_insert: Not implemented " + enums.codigo_interno.grupo_planif_necesidades_tab);
                break;
            case enums.codigo_interno.caracteristica_necesidad_tab: //51
                console.log("script_insert: Not implemented " + enums.codigo_interno.caracteristica_necesidad_tab);
                break;
            case enums.codigo_interno.punto_pedido_tab: //52
                console.log("script_insert: Not implemented " + enums.codigo_interno.punto_pedido_tab);
                break;
            case enums.codigo_interno.stock_alm_max_tab: //53
                console.log("script_insert: Not implemented " + enums.codigo_interno.stock_alm_max_tab);
                break;
            case enums.codigo_interno.planif_necesidades_tab: //54
                console.log("script_insert: Not implemented " + enums.codigo_interno.planif_necesidades_tab);
                break;
            case enums.codigo_interno.calculo_tamano_lote_tab: //55
                console.log("script_insert: Not implemented " + enums.codigo_interno.calculo_tamano_lote_tab);
                break;
            case enums.codigo_interno.valor_redondeo_tab: //56
                console.log("script_insert: Not implemented " + enums.codigo_interno.valor_redondeo_tab);
                break;
            case enums.codigo_interno.alm_aprov_ext_tab: //57
                console.log("script_insert: Not implemented " + enums.codigo_interno.alm_aprov_ext_tab);
                break;
            case enums.codigo_interno.plazo_entrega_prev_tab: //58
                console.log("script_insert: Not implemented " + enums.codigo_interno.plazo_entrega_prev_tab);
                break;
            case enums.codigo_interno.nivel_servicio_tab: //59
                console.log("script_insert: Not implemented " + enums.codigo_interno.nivel_servicio_tab);
                break;
            case enums.codigo_interno.stock_seguridad_tab: //60
                console.log("script_insert: Not implemented " + enums.codigo_interno.stock_seguridad_tab);
                break;
            case enums.codigo_interno.indicador_margen_seg_tab: //61
                console.log("script_insert: Not implemented " + enums.codigo_interno.indicador_margen_seg_tab);
                break;
            case enums.codigo_interno.margen_seguridad_tab: //62
                console.log("script_insert: Not implemented " + enums.codigo_interno.margen_seguridad_tab);
                break;
            case enums.codigo_interno.modelo_pronostico_tab: //63
                console.log("script_insert: Not implemented " + enums.codigo_interno.modelo_pronostico_tab);
                break;
            case enums.codigo_interno.periodo_pasado_tab: //64
                console.log("script_insert: Not implemented " + enums.codigo_interno.periodo_pasado_tab);
                break;
            case enums.codigo_interno.periodo_pronostico_tab: //65
                console.log("script_insert: Not implemented " + enums.codigo_interno.periodo_pronostico_tab);
                break;
            case enums.codigo_interno.periodo_estaci_tab: //66
                console.log("script_insert: Not implemented " + enums.codigo_interno.periodo_estaci_tab);
                break;
            case enums.codigo_interno.limite_alarma_tab: //67
                console.log("script_insert: Not implemented " + enums.codigo_interno.limite_alarma_tab);
                break;
            case enums.codigo_interno.clase_aprovis: //68
                script_insert_valor_texto(enums.codigo_interno.clase_aprovis, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.aprovis_especial: //69
                script_insert_valor_texto(enums.codigo_interno.aprovis_especial, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.toma_retrograda: //70
                script_insert_valor_texto(enums.codigo_interno.toma_retrograda, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.almacen_produccion: //71
                script_insert_valor_texto(enums.codigo_interno.almacen_produccion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.alm_aprov_ext: //[72]
                script_insert_valor_texto(enums.codigo_interno.alm_aprov_ext, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.alm_aprov_ext_pn2_centro:
                script_insert_valor_texto(enums.codigo_interno.alm_aprov_ext_pn2_centro, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.co_producto: //[73]
                script_insert_valor_texto(enums.codigo_interno.co_producto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tiempo_fab_propia_pn2: //74
                script_insert_valor_other(enums.codigo_interno.tiempo_fab_propia_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.plaza_entrega_prev: //75
                script_insert_valor_other(enums.codigo_interno.plaza_entrega_prev, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.clave_horizonte: //76
                script_insert_valor_texto(enums.codigo_interno.clave_horizonte, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.stock_seguridad_pn2: //77
                script_insert_valor_other(enums.codigo_interno.stock_seguridad_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.stock_seguridad_min_pn2: //78
                script_insert_valor_other(enums.codigo_interno.stock_seguridad_min_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.nivel_servicio_pn2: //79
                script_insert_valor_other(enums.codigo_interno.nivel_servicio_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.indicador_periodo: //80
                script_insert_valor_texto(enums.codigo_interno.indicador_periodo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_estrategia: //[81]
                script_insert_valor_texto(enums.codigo_interno.grupo_estrategia, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.planf_neces_mixtas: //[82]
                script_insert_valor_texto(enums.codigo_interno.planf_neces_mixtas, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.individual_colectivo: //83
                script_insert_valor_texto(enums.codigo_interno.individual_colectivo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.rechazo_componente: //84
                script_insert_valor_other(enums.codigo_interno.rechazo_componente, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.sujeto_lote: //85
                script_insert_valor_texto(enums.codigo_interno.sujeto_lote, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.responsable_control_produccion: //86
                script_insert_id(enums.codigo_interno.responsable_control_produccion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.perfil_control_fabricacion: //87
                script_insert_id(enums.codigo_interno.perfil_control_fabricacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_fabricacion: //88
                script_insert_valor_texto(enums.codigo_interno.unidad_medida_fabricacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.limite_exceso_sum_ilimitado: //89
                script_insert_valor_other(enums.codigo_interno.limite_exceso_sum_ilimitado, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.modelo_pronostico: //[91]
                script_insert_valor_texto(enums.codigo_interno.modelo_pronostico, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.periodo_pasado: //92
                script_insert_valor_other(enums.codigo_interno.periodo_pasado, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.periodo_pronostico: //93
                script_insert_valor_other(enums.codigo_interno.periodo_pronostico, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.inicializacion: //94
                script_insert_valor_texto(enums.codigo_interno.inicializacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.limite_alarma: //95
                script_insert_valor_other(enums.codigo_interno.limite_alarma, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grado_optimizacion: //96
                script_insert_valor_texto(enums.codigo_interno.grado_optimizacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.proc_sel_modelo: //97
                script_insert_valor_texto(enums.codigo_interno.proc_sel_modelo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.anular_automaticamente: //98
                script_insert_valor_texto(enums.codigo_interno.anular_automaticamente, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.optimizacion_parametro: //99
                script_insert_valor_texto(enums.codigo_interno.optimizacion_parametro, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.estructura_cuantica: //100
                script_insert_valor_texto(enums.codigo_interno.estructura_cuantica, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.origen_material: //101
                script_insert_valor_texto(enums.codigo_interno.origen_material, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tamano_lote: //102
                script_insert_valor_other(enums.codigo_interno.tamano_lote, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.clase_inspeccion_tab: //107
                console.log("script_insert: Not implemented " + enums.codigo_interno.clase_inspeccion_tab);
                break;
            case enums.codigo_interno.criticos: //108
                script_insert_valor_texto(enums.codigo_interno.criticos, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.estrategicos: //109
                script_insert_valor_texto(enums.codigo_interno.estrategicos, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ump_var: //110
                script_insert_valor_texto(enums.codigo_interno.ump_var, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.cantidad_base: //[111]
                script_insert_valor_other(enums.codigo_interno.cantidad_base, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.idioma: //112
                script_insert_valor_texto(enums.codigo_interno.idioma, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ampliacion: //113
                script_insert_valor_texto(enums.codigo_interno.ampliacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.precio_base: //114
                script_insert_valor_texto(enums.codigo_interno.precio_base, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.moneda: //115
                script_insert_valor_texto(enums.codigo_interno.moneda, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ind_ped_automa: //116
                script_insert_valor_texto(enums.codigo_interno.ind_ped_automa, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.exceso_sum_ilimitado: //117
                script_insert_valor_texto(enums.codigo_interno.exceso_sum_ilimitado, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.material_codigo_sap: //200
                script_insert_valor_texto(enums.codigo_interno.material_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.material_codigo_modelo: //             
                script_insert_valor_texto(enums.codigo_interno.material_codigo_modelo, tipo_tabla, campo, script);
                break;
            default:
                break;
        }
    });

    return { columnas: script.columnas, valores: script.valores };
};

function obtenerScriptParaActualizar(campos, tipo_tabla) {
    let script = '';

    campos.forEach(campo => {
        switch (campo.codigo_interno) {
            case enums.codigo_interno.ramo: //[1]
                script = script_update_valor_texto(enums.codigo_interno.ramo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.denominacion: //[2]
                script = script_update_valor_texto(enums.codigo_interno.denominacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_base: //[3]
                script = script_update_id(enums.codigo_interno.unidad_medida_base, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.peso_bruto: //[4]
                script = script_update_valor_other(enums.codigo_interno.peso_bruto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_peso: //[5]
                script = script_update_id(enums.codigo_interno.unidad_medida_peso, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.partida_arancelaria: //[6]
                script = script_update_valor_texto(enums.codigo_interno.partida_arancelaria, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.centro_codigo_sap: //[7]
                script = script_update_valor_texto(enums.codigo_interno.centro_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.centro_beneficio_codigo_sap: //[8]
                script = script_update_valor_texto(enums.codigo_interno.centro_beneficio_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.almacen_codigo_sap: //[9]
                script = script_update_valor_texto(enums.codigo_interno.almacen_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.organizacion_ventas: //[10]
                script = script_update_valor_texto(enums.codigo_interno.organizacion_ventas, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.canal_distribucion: //[11]
                script = script_update_valor_texto(enums.codigo_interno.canal_distribucion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.clasificacion_tab: //[12]
                console.log("script_insert: Not implemented " + enums.codigo_interno.clasificacion_tab);
                break;
            case enums.codigo_interno.tipo_material: //[13]
                script = script_update_valor_texto(enums.codigo_interno.tipo_material, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_articulo: //[14]
                script = script_update_valor_texto(enums.codigo_interno.grupo_articulo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.sector: //[15]
                script = script_update_valor_texto(enums.codigo_interno.sector, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_tipo_posicion_gral: //[16]
                script = script_update_valor_texto(enums.codigo_interno.grupo_tipo_posicion_gral, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.codigo_ean: //[17]
                script = script_update_valor_texto(enums.codigo_interno.codigo_ean, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tipo_ean: //[18]
                script = script_update_valor_texto(enums.codigo_interno.tipo_ean, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.texto_compra: //[19]
                script = script_update_valor_texto(enums.codigo_interno.texto_compra, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.link_adjunt: //[20]
                break
            case enums.codigo_interno.clasificacion_fiscal: //[21]
                script = script_update_valor_texto(enums.codigo_interno.clasificacion_fiscal, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_venta: //[22]
                script = script_update_id(enums.codigo_interno.unidad_medida_venta, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_estadistica_mat: //[23]
                script = script_update_valor_texto(enums.codigo_interno.grupo_estadistica_mat, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_tipo_posicion: //[24]
                script = script_update_valor_texto(enums.codigo_interno.grupo_tipo_posicion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_imputacion_material: //[25]
                script = script_update_valor_texto(enums.codigo_interno.grupo_imputacion_material, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.jerarquia_producto: //[26]
                script = script_update_valor_texto(enums.codigo_interno.jerarquia_producto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_material1: //[27]
                script = script_update_valor_texto(enums.codigo_interno.grupo_material1, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_material2: //[28]
                script = script_update_valor_texto(enums.codigo_interno.grupo_material2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.texto_comercial: //[29]
                script = script_update_valor_texto(enums.codigo_interno.texto_comercial, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.verificacion_disponibilidad: //[30]
                script = script_update_valor_texto(enums.codigo_interno.verificacion_disponibilidad, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_transporte: //[31]
                script = script_update_valor_texto(enums.codigo_interno.grupo_transporte, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_carga: //[32]
                script = script_update_valor_texto(enums.codigo_interno.grupo_carga, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.stock_negativo: //[33]
                script = script_update_valor_texto(enums.codigo_interno.stock_negativo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.formula_concreto: //[34]
                script = script_update_valor_texto(enums.codigo_interno.formula_concreto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_compra: //[35]
                script = script_update_valor_texto(enums.codigo_interno.grupo_compra, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_pedido: //[36]
                script = script_update_id(enums.codigo_interno.unidad_medida_pedido, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.precio_estandar: //[37]
                script = script_update_valor_other(enums.codigo_interno.precio_estandar, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.precio_variable: //[38]
                script = script_update_valor_other(enums.codigo_interno.precio_variable, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.categoria_valoracion: //[39]
                script = script_update_valor_texto(enums.codigo_interno.categoria_valoracion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.control_precio: //[40]
                script = script_update_valor_texto(enums.codigo_interno.control_precio, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.determinacion_precio: //[41]
                script = script_update_valor_texto(enums.codigo_interno.determinacion_precio, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_almacen: //[42]
                script = script_update_id(enums.codigo_interno.unidad_medida_almacen, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ubicacion: //[43]
                script = script_update_valor_texto(enums.codigo_interno.ubicacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.dcto_pronto_pago: //[44]
                script = script_update_valor_other(enums.codigo_interno.dcto_pronto_pago, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_planif_necesidades: //[45]
                script = script_update_valor_texto(enums.codigo_interno.grupo_planif_necesidades, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tipo_mrp_caract_plani: //[46]
                script = script_update_valor_texto(enums.codigo_interno.tipo_mrp_caract_plani, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.planif_necesidades: //[47]
                script = script_update_valor_texto(enums.codigo_interno.planif_necesidades, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.calculo_tamano_lote: //[48]
                script = script_update_valor_texto(enums.codigo_interno.calculo_tamano_lote, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.area_planificacion_tab: //[49]
                break;
            case enums.codigo_interno.grupo_planif_necesidades_tab: //[50]
                break;
            case enums.codigo_interno.caracteristica_necesidad_tab: //[51|
                break;
            case enums.codigo_interno.punto_pedido_tab: //[52|
                break;
            case enums.codigo_interno.stock_alm_max_tab: //[53]
                break;
            case enums.codigo_interno.planif_necesidades_tab: //[54]
                break;
            case enums.codigo_interno.calculo_tamano_lote_tab: //[55]
                break;
            case enums.codigo_interno.valor_redondeo_tab: //[56]
                break;
            case enums.codigo_interno.alm_aprov_ext_tab: //[57]
                break;
            case enums.codigo_interno.plazo_entrega_prev_tab: //[58]
                break;
            case enums.codigo_interno.nivel_servicio_tab: //[59]
                break;
            case enums.codigo_interno.stock_seguridad_tab: //[60]
                break;
            case enums.codigo_interno.indicador_margen_seg_tab: //[61]
                break;
            case enums.codigo_interno.margen_seguridad_tab: //[62]
                break;
            case enums.codigo_interno.modelo_pronostico_tab: //[63]
                break;
            case enums.codigo_interno.periodo_pasado_tab: //[64]
                break;
            case enums.codigo_interno.periodo_pronostico_tab: //[65]
                break;
            case enums.codigo_interno.periodo_estaci_tab: //[66]
                break;
            case enums.codigo_interno.limite_alarma_tab: //[67]
                break;
            case enums.codigo_interno.clase_aprovis: //[68]
                script = script_update_valor_texto(enums.codigo_interno.clase_aprovis, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.aprovis_especial: //[69]
                script = script_update_valor_texto(enums.codigo_interno.aprovis_especial, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.toma_retrograda: //[70]
                script = script_update_valor_texto(enums.codigo_interno.toma_retrograda, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.almacen_produccion: //[71]
                script = script_update_valor_texto(enums.codigo_interno.almacen_produccion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.alm_aprov_ext: //[72]
                script = script_update_valor_texto(enums.codigo_interno.alm_aprov_ext, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.alm_aprov_ext_pn2_centro:
                script = script_update_valor_texto(enums.codigo_interno.alm_aprov_ext_pn2_centro, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.co_producto: //[73]
                script = script_update_valor_texto(enums.codigo_interno.co_producto, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tiempo_fab_propia_pn2: //[74]
                script = script_update_valor_other(enums.codigo_interno.tiempo_fab_propia_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.plaza_entrega_prev: //[75]
                script = script_update_valor_other(enums.codigo_interno.plaza_entrega_prev, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.clave_horizonte: //[76]
                script = script_update_valor_texto(enums.codigo_interno.clave_horizonte, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.stock_seguridad_pn2: //[77]
                script = script_update_valor_other(enums.codigo_interno.stock_seguridad_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.stock_seguridad_min_pn2: //[78]
                script = script_update_valor_other(enums.codigo_interno.stock_seguridad_min_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.nivel_servicio_pn2: //[79]
                script = script_update_valor_other(enums.codigo_interno.nivel_servicio_pn2, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.indicador_periodo: //[80]
                script = script_update_valor_texto(enums.codigo_interno.indicador_periodo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grupo_estrategia: //[81]
                script = script_update_valor_texto(enums.codigo_interno.grupo_estrategia, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.planf_neces_mixtas: //[82]
                script = script_update_valor_texto(enums.codigo_interno.planf_neces_mixtas, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.individual_colectivo: //[83]
                script = script_update_valor_texto(enums.codigo_interno.individual_colectivo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.rechazo_componente: //[84]
                script = script_update_valor_other(enums.codigo_interno.rechazo_componente, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.sujeto_lote: //[85]
                script = script_update_valor_texto(enums.codigo_interno.sujeto_lote, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.responsable_control_produccion: //[86]
                script = script_update_id(enums.codigo_interno.responsable_control_produccion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.perfil_control_fabricacion: //[87]
                script = script_update_id(enums.codigo_interno.perfil_control_fabricacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.unidad_medida_fabricacion: //[88]
                script = script_update_valor_texto(enums.codigo_interno.unidad_medida_fabricacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.limite_exceso_sum_ilimitado: //[89]
                script = script_update_valor_other(enums.codigo_interno.limite_exceso_sum_ilimitado, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.modelo_pronostico: //[91]
                script = script_update_valor_texto(enums.codigo_interno.modelo_pronostico, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.periodo_pasado: //[92]
                script = script_update_valor_other(enums.codigo_interno.periodo_pasado, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.periodo_pronostico: //[93]
                script = script_update_valor_other(enums.codigo_interno.periodo_pronostico, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.inicializacion: //[94]
                script = script_update_valor_texto(enums.codigo_interno.inicializacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.limite_alarma: //[95]
                script = script_update_valor_other(enums.codigo_interno.limite_alarma, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.grado_optimizacion: //[96]
                script = script_update_valor_texto(enums.codigo_interno.grado_optimizacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.proc_sel_modelo: //[97]
                script = script_update_valor_texto(enums.codigo_interno.proc_sel_modelo, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.anular_automaticamente: //[98]
                script = script_update_valor_texto(enums.codigo_interno.anular_automaticamente, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.optimizacion_parametro: //[99]
                script = script_update_valor_texto(enums.codigo_interno.optimizacion_parametro, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.estructura_cuantica: //[100]
                script = script_update_valor_texto(enums.codigo_interno.estructura_cuantica, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.origen_material: //[101]
                script = script_update_valor_texto(enums.codigo_interno.origen_material, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.tamano_lote: //[102]
                script = script_update_valor_other(enums.codigo_interno.tamano_lote, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.clase_inspeccion_tab: //107
                break;
            case enums.codigo_interno.criticos: //[108]
                script = script_update_valor_texto(enums.codigo_interno.criticos, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.estrategicos: //[109]
                script = script_update_valor_texto(enums.codigo_interno.estrategicos, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ump_var: //[110]
                script = script_update_valor_texto(enums.codigo_interno.ump_var, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.cantidad_base: //[111]
                script = script_update_valor_other(enums.codigo_interno.cantidad_base, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.idioma: //[112]
                script = script_update_valor_texto(enums.codigo_interno.idioma, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ampliacion: //[113]
                script = script_update_valor_texto(enums.codigo_interno.ampliacion, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.precio_base: //[114]
                script = script_update_valor_other(enums.codigo_interno.precio_base, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.moneda: //[115]
                script = script_update_valor_texto(enums.codigo_interno.moneda, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.ind_ped_automa: //[116]
                script = script_update_valor_texto(enums.codigo_interno.ind_ped_automa, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.exceso_sum_ilimitado: //[117]
                script = script_update_valor_texto(enums.codigo_interno.exceso_sum_ilimitado, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.material_codigo_sap: //[200]
                script = script_update_valor_texto(enums.codigo_interno.material_codigo_sap, tipo_tabla, campo, script);
                break;
            case enums.codigo_interno.material_codigo_modelo: //
                script = script_update_valor_texto(enums.codigo_interno.material_codigo_modelo, tipo_tabla, campo, script);
                break;
            default:
                break;
        }
    });

    return script;
};

function script_insert_valor_texto(codigo_interno, tipo_tabla, campo, script) {
    const columna = enums.columna[codigo_interno];

    if (tipo_tabla === enums.tipo_tabla.original) {
        script.columnas = script.columnas.concat(columna.original, ", ");
        script.valores = campo.error ? script.valores.concat("null, ") : script.valores.concat("'", campo.valor, "', ");
    }
    else if (tipo_tabla === enums.tipo_tabla.borrador) {
        script.columnas = script.columnas.concat(columna.borrador, ", ", columna.error, ", ");
        script.valores = script.valores.concat("'", campo.valor, "', ", campo.error, ", ");
    }

    return script;
};

function script_insert_valor_other(codigo_interno, tipo_tabla, campo, script) {
    const columna = enums.columna[codigo_interno];

    if (tipo_tabla === enums.tipo_tabla.original) {
        script.columnas = script.columnas.concat(columna.original, ", ");
        script.valores = campo.error ? script.valores.concat("null, ") : script.valores.concat("'", campo.valor, "', ");
    }
    else if (tipo_tabla === enums.tipo_tabla.borrador) {
        script.columnas = script.columnas.concat(columna.borrador, ", ", columna.error, ", ");
        script.valores = script.valores.concat(campo.valor, ", ", campo.error, ", ");
    }

    return script;
};

function script_insert_id(codigo_interno, tipo_tabla, campo, script) {
    const columna = enums.columna[codigo_interno];

    if (tipo_tabla === enums.tipo_tabla.original) {
        script.columnas = script.columnas.concat(columna.original, ", ");
        script.valores = campo.error ? script.valores.concat("null, ") : script.valores.concat(campo.id, ", ");
    }
    else if (tipo_tabla === enums.tipo_tabla.borrador) {
        script.columnas = script.columnas.concat(columna.borrador, ", ", columna.error, ", ");
        script.valores = script.valores.concat("'", campo.valor, "', ", campo.error, ", ");
    }

    return script;
}

function script_update_valor_texto(codigo_interno, tipo_tabla, campo, script) {
    const columna = enums.columna[codigo_interno];

    if (tipo_tabla === enums.tipo_tabla.original) {
        script = campo.error ? script.concat(columna.original, " = null, ") : script.concat(columna.original, " = '", campo.valor, "', ")
    }
    else if (tipo_tabla === enums.tipo_tabla.borrador) {
        script = script.concat(columna.borrador, " = '", campo.valor, "', ", columna.error, ' = ', campo.error, ', ');
    }

    return script;
};

function script_update_valor_other(codigo_interno, tipo_tabla, campo, script) {
    const columna = enums.columna[codigo_interno];

    if (tipo_tabla === enums.tipo_tabla.original) {
        script = campo.error ? script.concat(columna.original, " = null, ") : script.concat(columna.original, " = ", campo.valor, ", ")
    }
    else if (tipo_tabla === enums.tipo_tabla.borrador) {
        script = script.concat(columna.borrador, " = '", campo.valor, "', ", columna.error, ' = ', campo.error, ', ');
    }

    return script;
};

function script_update_id(codigo_interno, tipo_tabla, campo, script) {
    const columna = enums.columna[codigo_interno];

    if (tipo_tabla === enums.tipo_tabla.original) {
        script = campo.error ? script.concat(columna.original, " = null, ") : script.concat(columna.original, " = ", campo.id, ", ")
    }
    else if (tipo_tabla === enums.tipo_tabla.borrador) {
        script = script.concat(columna.borrador, " = '", campo.valor, "', ", columna.error, ' = ', campo.error, ', ');
    }

    return script;
};
//#endregion

module.exports = service;