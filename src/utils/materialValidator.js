const enums = require('../utils/enums');
const postgresConn = require('../connections/postgres');
const materialSolicitudService = require('../services/materialSolicitudService');
const { emptyString } = require('./constantes');

const validator = {};

validator.validar_decimal = async (codigo_interno, material, result, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && campo.valor.length > length_borrador) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            if (isNaN(campo.valor)) {
                campo.error = true;
            } else {

                const longitud = list.filter(function (item) { return item.codigo_interno == codigo_interno })[0] || null;

                if (longitud) {
                    campo.valor = Math.trunc(campo.valor * Math.pow(10, longitud.decimals)) / Math.pow(10, longitud.decimals)
                }

                campo.error = false;
            }
        }

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_texto = async (codigo_interno, material, result, length, length_borrador = 20) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            campo.error = false;
        }

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_codigo_sap = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            if (campo.porDefecto) {
                campo.error = false;
            } else {
                if (list) {
                    campo.valor = campo.valor.toString();
                    let obj = list.filter(function (item) { return item.codigo_sap == campo.valor })[0] || null;
                    campo.error = !obj;
                } else {
                    campo.error = true;
                }
            }
        }

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_codigo_sap_centro = async (codigo_interno, material, result, length, length_borrador = 20, list, centro_codigo_sap) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            if (campo.porDefecto) {
                campo.error = false;
            } else {
                if (list) {
                    campo.valor = campo.valor.toString();
                    let obj = list.filter(function (item) { return item.codigo_sap === campo.valor && item.centro_codigo_sap === centro_codigo_sap })[0] || null;
                    if (obj) {
                        campo.id = obj.id;
                    }
                    campo.error = !obj;
                } else {
                    campo.error = true;
                }
            }
        }
        console.log(campo);
        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_unidad_medida = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            if (list) {
                let obj = list.filter(function (item) { return item.codigo_sap == campo.valor })[0] || null;

                if (obj) {
                    campo.id = obj.id;
                    campo.error = false;
                } else {
                    campo.id = null;
                    campo.error = true;
                }
            } else {
                campo.error = false;
            }
        }

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_denominacion = async (material, result, length, length_borrador, denominacionesEnSAP, obj_material, tipo_carga) => {
    const campo = obtenerCampo(enums.codigo_interno.denominacion, material.campos);

    if (campo) {
        console.log('validar_denominacion');

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            if (campo.valor === '') {
                campo.error = true;
            } else {
                if (obj_material) {
                    console.log('update');
                    console.log('update: antes - ' + obj_material.denominacion);
                    console.log('update: despues - ' + campo.valor);
                    if (obj_material.denominacion !== campo.valor) {
                        console.log('update: cambio denominacion');
                        campo.error = false;
                        const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                        if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
                        else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }
                    } else {
                        console.log('update: no cambio denominacion');
                        campo.error = false;

                        if (tipo_carga === enums.tipoCarga.individual) {
                            const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                            if (denominacionEnDb && denominacionEnDb.length > 1) { campo.error = true; }
                        }
                    }
                } else {
                    console.log('insert');
                    campo.error = false;
                    const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                    if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
                    else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }
                }
            }
        }

        result.campos = removerCampo(enums.codigo_interno.denominacion, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_denominacion_old = async (material, result, tipoCarga, tipoOperacion, id_solicitud, obj_material, request, denominacionesEnSAP) => {
    const groupResult = { actualizaciones: [] };
    const campo = obtenerCampo(enums.codigo_interno.denominacion, material.campos);

    if (campo) {
        console.log('validar_denominacion');

        if (tipoCarga === enums.tipoCarga.individual) {
            if (tipoOperacion === enums.tipoOperacion.insertar) {
                var validator = await validar_denominacion_individual_insertar(campo, material, id_solicitud, denominacionesEnSAP);
            }
            else if (tipoOperacion === enums.tipoOperacion.actualizar) {
                var validator = await validar_denominacion_individual_actualizar(campo, material, id_solicitud, obj_material, denominacionesEnSAP);
            }
        } else if (tipoCarga === enums.tipoCarga.masivo) {
            if (tipoOperacion === enums.tipoOperacion.insertar) {
                var validator = await validar_denominacion_masivo_insertar(campo, material, id_solicitud, request, denominacionesEnSAP);
            }
            else if (tipoOperacion === enums.tipoOperacion.actualizar) {
                var validator = await validar_denominacion_masivo_actualizar(campo, material, id_solicitud, request, obj_material, denominacionesEnSAP);
            }
        }

        result.campos = removerCampo(enums.codigo_interno.denominacion, result.campos);
        result.campos.push(validator.campo);

        if (validator && validator.actualizaciones.length > 0) {
            groupResult.actualizaciones = validator.actualizaciones;
        }
    }

    groupResult.result = result;
    return groupResult;
};

validator.validar_ampliacion = async (id_solicitud, result, tipo_carga) => {
    const materialesEnDb = await materialSolicitudService.listarMaterialesParaValidarAmpliacion(postgresConn, id_solicitud);

    // Establecer un orden
    for (let index = 0; index < result.length; index++) {
        result[index].index = index + 1;
    }

    // Completar datos si es update
    for (let index = 0; index < result.length; index++) {
        const material = result[index];

        console.log("Completar datos para: " + material.id_material_solicitud);
        if (material.id_material_solicitud) {

            for (let i = 0; i < materialesEnDb.length; i++) {
                const materialEnDb = materialesEnDb[i];

                if (material.id_material_solicitud == materialEnDb.id_material_solicitud) {
                    console.log("Completar datos para coincidencia ");
                    var denominacion = obtenerCampo(enums.codigo_interno.denominacion, material.campos);
                    if (!denominacion) {
                        console.log("Completar denominacion: " + materialEnDb.denominacion);
                        material.campos.push({ codigo_interno: enums.codigo_interno.denominacion, valor: materialEnDb.denominacion, error: materialEnDb.denominacion_error });
                    }

                    var centro_codigo_sap = obtenerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
                    if (!centro_codigo_sap) {
                        console.log("Completar centro_codigo_sap: " + materialEnDb.centro_codigo_sap);
                        material.campos.push({ codigo_interno: enums.codigo_interno.centro_codigo_sap, valor: materialEnDb.centro_codigo_sap, error: materialEnDb.centro_codigo_sap_error });
                    }

                    var almacen_codigo_sap = obtenerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);
                    if (!almacen_codigo_sap) {
                        console.log("Completar almacen_codigo_sap: " + materialEnDb.almacen_codigo_sap);
                        material.campos.push({ codigo_interno: enums.codigo_interno.almacen_codigo_sap, valor: materialEnDb.almacen_codigo_sap, error: materialEnDb.almacen_codigo_sap_error });
                    }

                    break;
                }
            }
        }
    }

    for (let index = 0; index < result.length; index++) {
        const material = result[index];
        console.log(material);
        const campo_denominacion = obtenerCampo(enums.codigo_interno.denominacion, material.campos);
        const denominacion = obtenerCampoValor(enums.codigo_interno.denominacion, material.campos);
        const centro = obtenerCampoValor(enums.codigo_interno.centro_codigo_sap, material.campos);
        const almacen = obtenerCampoValor(enums.codigo_interno.almacen_codigo_sap, material.campos);
        const clave = centro + '_' + almacen;
        let found = false;

        // Buscar en Base de datos
        for (let i = 0; i < materialesEnDb.length; i++) {
            const db = materialesEnDb[i];
            const db_clave = db.centro_codigo_sap + '_' + db.almacen_codigo_sap;

            if (material.id_material_solicitud) {
                console.log("db: update");

                if (material.id_material_solicitud == db.id_material_solicitud) {
                    console.log("db: myself");

                    if (denominacion === db.denominacion) {
                        console.log("db: = denominacion");

                        if (clave === db_clave) {
                            console.log("db: = clave");
                            material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: '', error: false });

                            //if (tipo_carga === enums.tipoCarga.masivo) {
                            found = true;
                            break;
                            //}
                        } else {
                            console.log("db: <> clave");
                            material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: '', error: false });

                            if (tipo_carga === enums.tipoCarga.masivo) {
                                found = true;
                                break;
                            }
                        }
                    } else {
                        console.log("db: <> denominacion");

                        if (clave === db_clave) {
                            console.log("db: = clave");

                            material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: '', error: false });
                            if (tipo_carga === enums.tipoCarga.masivo) {
                                found = true;
                                break;
                            }
                        } else {
                            console.log("db: <> clave");

                            material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: '', error: false });
                            if (tipo_carga === enums.tipoCarga.masivo) {
                                found = true;
                                break;
                            }
                        }
                    }
                } else {
                    console.log("db: other");

                    if (denominacion === db.denominacion) {
                        console.log("db: = denominacion");

                        if (clave === db_clave) {
                            console.log("db: = clave");
                        } else {
                            console.log("db: <> clave");
                            if (db.ampliacion !== 'X') {
                                material.campos = removerCampo(enums.codigo_interno.ampliacion, material.campos);
                                material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });

                                campo_denominacion.error = false;
                                material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                                material.campos.push(campo_denominacion);
                                found = true;
                                break;
                            } else {
                                campo_denominacion.error = true;
                                material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                                material.campos.push(campo_denominacion);
                                found = true;
                                break;
                            }
                        }
                    } else {
                        console.log("db: <> denominacion");

                        if (clave === db_clave) {
                            console.log("db: = clave");

                        } else {
                            console.log("db: <> clave");

                            if (db.ampliacion !== 'X') {
                                material.campos = removerCampo(enums.codigo_interno.ampliacion, material.campos);
                                material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });

                                campo_denominacion.error = false;
                                material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                                material.campos.push(campo_denominacion);
                                found = true;
                                break;
                            } else {
                                campo_denominacion.error = true;
                                material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                                material.campos.push(campo_denominacion);
                                found = true;
                                break;
                            }
                        }
                    }
                }
            } else {
                console.log("db: insert");

                if (denominacion === db.denominacion) {
                    console.log("db: = denominacion");

                    if (clave === db_clave) {
                        console.log("db: = clave");
                    } else {
                        console.log("db: <> clave");
                        if (db.ampliacion !== 'X') {
                            material.campos = removerCampo(enums.codigo_interno.ampliacion, material.campos);
                            material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });

                            campo_denominacion.error = false;
                            material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                            material.campos.push(campo_denominacion);
                            found = true;
                            break;
                        } else {
                            campo_denominacion.error = true;
                            material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                            material.campos.push(campo_denominacion);
                            found = true;
                            break;
                        }
                    }
                } else {
                    console.log("db: <> denominacion");

                    if (clave === db_clave) {
                        console.log("db: = clave");
                    } else {
                        console.log("db: <> clave");
                    }
                }
            }
        }

        if (found) {
            continue;
        }

        // Buscar en Request
        for (let i = 0; i < result.length; i++) {
            const rq = result[i];
            const rq_denominacion = obtenerCampoValor(enums.codigo_interno.denominacion, rq.campos);
            const rq_centro = obtenerCampoValor(enums.codigo_interno.centro_codigo_sap, rq.campos);
            const rq_almacen = obtenerCampoValor(enums.codigo_interno.almacen_codigo_sap, rq.campos);
            const rq_clave = rq_centro + '_' + rq_almacen;
            const rq_ampliacion = obtenerCampoValor(enums.codigo_interno.ampliacion, rq.campos);

            if (material.index === rq.index) {
                console.log("rq: myself");
            }
            else {
                console.log("rq: other");

                if (denominacion === rq_denominacion) {
                    console.log("rq: = denominacion");

                    if (clave === rq_clave) {
                        console.log("rq: = clave");
                    } else {
                        console.log("rq: <> clave");

                        if (material.index > rq.index) {
                            console.log(rq_ampliacion);
                            if (rq_ampliacion !== 'X') {
                                console.log("rq: el otro es ampliacion");
                                material.campos = removerCampo(enums.codigo_interno.ampliacion, material.campos);
                                material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });

                                campo_denominacion.error = false;
                                material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                                material.campos.push(campo_denominacion);
                            } else {
                                campo_denominacion.error = true;
                                material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                                material.campos.push(campo_denominacion);
                            }
                        }
                    }
                } else {
                    console.log("rq: <> denominacion");

                    if (clave === rq_clave) {
                        console.log("rq: = clave");
                    } else {
                        console.log("rq: <> clave");
                    }
                }
            }
        }
    }

    return result;
};

async function validar_ampliacion_individual_insertar(requestValidado, id_solicitud) {
    // Traer materiales por solicitud
    const materialesEnDb = [];
    const materialERequest = {};

    const denominacion = '';
    const centro_codigo_sap = '';
    const almacen_codigo_sap = '';
    const clave_request = centro_codigo_sap + '_' + almacen_codigo_sap;
    const ampliacion = false;

    // Verificar si es una ampliacion
    materialesEnDb.forEach(element => {
        const clave_db = element.centro_codigo_sap + '_' + element.almacen_codigo_sap;

        if (denominacion === element.denominacion && (clave_request === clave_db)) {
            ampliacion = true;
            return;
        }
    });

    // Definir hijos

};

async function validar_denominacion_individual_insertar(campo, material, id_solicitud, denominacionesEnSAP) {
    var result = { actualizaciones: [] };
    campo.error = false;

    if (campo.valor && campo.valor.length > 40) {
        campo.valor = campo.valor.substring(0, 40);
        campo.error = true;
    }
    else {

        if (condition) {

        }



        const ampliacion = obtenerCampo(enums.codigo_interno.ampliacion, material.campos);

        if (ampliacion && ampliacion.valor === 'X') {
            const centro_codigo_sap = obtenerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
            const almacen_codigo_sap = obtenerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);

            const posiblesPadres = await materialSolicitudService.listarPosiblesPadres(postgresConn, id_solicitud, campo.valor, centro_codigo_sap, almacen_codigo_sap);

            if (!posiblesPadres || posiblesPadres.length === 0) {
                campo.error = true;
            }
        } else {
            const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
            if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
            else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }
        }
    }

    result.campo = campo;
    return result;
};

async function validar_denominacion_individual_insertar_old(campo, material, id_solicitud, denominacionesEnSAP) {
    var result = { actualizaciones: [] };
    campo.error = false;

    if (campo.valor && campo.valor.length > 40) {
        campo.valor = campo.valor.substring(0, 40);
        campo.error = true;
    }
    else {
        const ampliacion = obtenerCampo(enums.codigo_interno.ampliacion, material.campos);

        if (ampliacion && ampliacion.valor === 'X') {
            const centro_codigo_sap = obtenerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
            const almacen_codigo_sap = obtenerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);

            const posiblesPadres = await materialSolicitudService.listarPosiblesPadres(postgresConn, id_solicitud, campo.valor, centro_codigo_sap, almacen_codigo_sap);

            if (!posiblesPadres || posiblesPadres.length === 0) {
                campo.error = true;
            }
        } else {
            const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
            if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
            else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }
        }
    }

    result.campo = campo;
    return result;
};

async function validar_denominacion_individual_actualizar(campo, material, id_solicitud, obj_material, denominacionesEnSAP) {
    var result = { actualizaciones: [] };
    campo.error = false;

    if (obj_material.denominacion !== campo.valor) {
        const ampliacion = obtenerCampoWithDefault(enums.codigo_interno.ampliacion, material.campos, obj_material);

        if (campo.valor && campo.valor.length > 40) {
            campo.valor = campo.valor.substring(0, 40);
            campo.error = true;

            if (!ampliacion || ampliacion.valor === '') {
                const hijos = await materialSolicitudService.listarHijos(postgresConn, id_solicitud, obj_material.denominacion, obj_material.centro_codigo_sap, obj_material.almacen_codigo_sap);

                if (hijos && hijos.length > 0) {
                    hijos.forEach(hijo => {
                        result.actualizaciones.push({
                            id_material_solicitud: hijo.id,
                            campos: [{
                                codigo_interno: enums.codigo_interno.denominacion,
                                valor: hijo.denominacion,
                                error: true
                            }]
                        });
                    });
                }
            }
        }
        else {
            if (ampliacion && ampliacion.valor === 'X') {
                const centro_codigo_sap = obtenerCampoWithDefault(enums.codigo_interno.centro_codigo_sap, material.campos, obj_material);
                const almacen_codigo_sap = obtenerCampoWithDefault(enums.codigo_interno.almacen_codigo_sap, material.campos, obj_material);

                const posiblesPadres = await materialSolicitudService.listarPosiblesPadres(postgresConn, id_solicitud, campo.valor, centro_codigo_sap, almacen_codigo_sap);

                if (!posiblesPadres || posiblesPadres.length === 0) {
                    campo.error = true;
                }
            } else {
                const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
                else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }

                const hijos = await materialSolicitudService.listarHijos(postgresConn, id_solicitud, obj_material.denominacion, obj_material.centro_codigo_sap, obj_material.almacen_codigo_sap);

                if (hijos && hijos.length > 0) {
                    if (hijos && hijos.length > 0) {
                        hijos.forEach(hijo => {
                            result.actualizaciones.push({
                                id_material_solicitud: hijo.id,
                                campos: [{
                                    codigo_interno: enums.codigo_interno.denominacion,
                                    valor: hijo.denominacion,
                                    error: true
                                }]
                            });
                        });
                    }
                }
            }
        }
    }

    result.campo = campo;
    return result;
};

async function validar_denominacion_masivo_insertar(campo, material, id_solicitud, request, denominacionesEnSAP) {
    var result = { actualizaciones: [] };
    campo.error = false;

    if (campo.valor && campo.valor.length > 40) {
        campo.valor = campo.valor.substring(0, 40);
        campo.error = true;
    }
    else {
        const ampliacion = obtenerCampo(enums.codigo_interno.ampliacion, material.campos);

        if (ampliacion && ampliacion.valor === 'X') {
            const centro_codigo_sap = obtenerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
            const almacen_codigo_sap = obtenerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);

            const padresEnRequest = existePadreEnRequest(request, campo.valor, centro_codigo_sap, almacen_codigo_sap);
            if (!padresEnRequest) {
                const posiblesPadres = await materialSolicitudService.listarPosiblesPadres(postgresConn, id_solicitud, campo.valor, centro_codigo_sap, almacen_codigo_sap);

                if (!posiblesPadres || posiblesPadres.length === 0) {
                    campo.error = true;
                }
            }

        } else {
            if (existeDenominacionEnRequest(request, campo.valor)) {
                campo.error = true;
            } else {
                const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
                else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }
            }
        }
    }

    result.campo = campo;
    return result;
};

async function validar_denominacion_masivo_actualizar(campo, material, id_solicitud, request, obj_material, denominacionesEnSAP) {
    var result = { actualizaciones: [] };
    campo.error = false;

    if (obj_material.denominacion !== campo.valor) {
        const ampliacion = obtenerCampoWithDefault(enums.codigo_interno.ampliacion, material.campos, obj_material);

        if (campo.valor && campo.valor.length > 40) {
            campo.valor = campo.valor.substring(0, 40);
            campo.error = true;

            if (!ampliacion || ampliacion.valor === '') {
                const hijos = await materialSolicitudService.listarHijos(postgresConn, id_solicitud, obj_material.denominacion, obj_material.centro_codigo_sap, obj_material.almacen_codigo_sap);

                if (hijos && hijos.length > 0) {
                    hijos.forEach(hijo => {
                        result.actualizaciones.push({
                            id_material_solicitud: hijo.id,
                            campos: [{
                                codigo_interno: enums.codigo_interno.denominacion,
                                valor: hijo.denominacion,
                                error: true
                            }]
                        });
                    });
                }
            }
        }
        else {
            if (ampliacion && ampliacion.valor === 'X') {
                const centro_codigo_sap = obtenerCampoWithDefault(enums.codigo_interno.centro_codigo_sap, material.campos, obj_material);
                const almacen_codigo_sap = obtenerCampoWithDefault(enums.codigo_interno.almacen_codigo_sap, material.campos, obj_material);

                const padresEnRequest = existePadreEnRequest(request, campo.valor, centro_codigo_sap, almacen_codigo_sap);
                if (!padresEnRequest) {
                    const posiblesPadres = await materialSolicitudService.listarPosiblesPadres(postgresConn, id_solicitud, campo.valor, centro_codigo_sap, almacen_codigo_sap);

                    if (!posiblesPadres || posiblesPadres.length === 0) {
                        campo.error = true;
                    }
                }
            } else {
                if (existeDenominacionEnRequest(request, campo.valor)) {
                    campo.error = true;
                } else {
                    const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                    if (denominacionEnDb && denominacionEnDb.length > 0) { campo.error = true; }
                    else { campo.error = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor) }

                    const hijos = await materialSolicitudService.listarHijos(postgresConn, id_solicitud, obj_material.denominacion, obj_material.centro_codigo_sap, obj_material.almacen_codigo_sap);

                    if (hijos && hijos.length > 0) {
                        hijos.forEach(hijo => {
                            result.actualizaciones.push({
                                id_material_solicitud: hijo.id,
                                campos: [{
                                    codigo_interno: enums.codigo_interno.denominacion,
                                    valor: hijo.denominacion,
                                    error: true
                                }]
                            });
                        });
                    }
                }
            }
        }
    }

    result.campo = campo;
    return result;
};

validator.validar_centro = async (material, result, length, length_borrador = 20, list, obj_material) => {
    const campo = obtenerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);

    if (campo) {
        console.log('validar_' + enums.codigo_interno.centro_codigo_sap);

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            if (list) {
                campo.valor = campo.valor.toString();
                let obj = list.filter(function (item) { return item.codigo_sap == campo.valor })[0] || null;

                if (obj) {
                    campo.error = false;
                }
                else {
                    campo.error = true;
                }
            } else {
                campo.error = true;
            }
        }
        console.log(campo);
        result.campos = removerCampo(enums.codigo_interno.centro_codigo_sap, result.campos);
        result.campos.push(campo);
    } else {
        if (obj_material) {
            campo = {
                codigo_interno: enums.codigo_interno.centro_codigo_sap,
                valor: obj_material.centro_codigo_sap,
                error: obj_material.centro_codigo_sap_error
            };

            result.campos.push(campo);
        }
    }

    return result;
};

validator.validar_clasificacion = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        await asyncForEach(campo.valores, async (clasificacion) => {
            if (clasificacion.valor && clasificacion.valor.length > length) {
                clasificacion.valor = clasificacion.valor.substring(0, length_borrador);
                clasificacion.error = true;
            } else {
                if (list) {
                    let obj = list.filter(function (item) { return item.codigo_sap == clasificacion.valor })[0] || null;

                    if (obj) {
                        clasificacion.id = obj.id_clasificacion;
                        clasificacion.error = false;
                    } else {
                        clasificacion.id = null;
                        clasificacion.error = true;
                    }
                } else {
                    clasificacion.error = false;
                }
            }
        });

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_area_planificacion = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        await asyncForEach(campo.valores, async (area_planificacion) => {
            if (area_planificacion.valor && area_planificacion.valor.length > length) {
                area_planificacion.valor = area_planificacion.valor.substring(0, length_borrador);
                area_planificacion.error = true;
            } else {
                if (list) {
                    let obj = list.filter(function (item) { return item.codigo_sap == area_planificacion.valor })[0] || null;

                    if (obj) {
                        area_planificacion.id = obj.codigo_sap;
                        area_planificacion.error = false;
                    } else {
                        area_planificacion.id = null;
                        area_planificacion.error = true;
                    }
                } else {
                    area_planificacion.error = false;
                }
            }
        });

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_clase_inspeccion_tab = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        await asyncForEach(campo.valores, async (clase_inspeccion) => {
            if (clase_inspeccion.valor && clase_inspeccion.valor.length > length) {
                clase_inspeccion.valor = clase_inspeccion.valor.substring(0, length_borrador);
                clase_inspeccion.error = true;
            } else {
                if (list) {
                    let obj = list.filter(function (item) { return item.codigo_sap == clase_inspeccion.valor })[0] || null;

                    if (obj) {
                        clase_inspeccion.id = obj.id_clase_inspeccion;
                        clase_inspeccion.error = false;
                    } else {
                        clase_inspeccion.id = null;
                        clase_inspeccion.error = true;
                    }
                } else {
                    clase_inspeccion.error = false;
                }
            }
        });

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_ampliacion_old = async (material, result) => {
    const campo = obtenerCampo(enums.codigo_interno.ampliacion, material.campos);

    if (campo) {
        console.log('validar_ampliacion');

        if (campo.valor && campo.valor.length > 5) {
            campo.valor = campo.valor.substring(0, 20);
            campo.error = true;
        } else {
            if (campo.valor !== emptyString && campo.valor !== 'X') {
                campo.error = true;
            } else {
                campo.error = false;
            }
        }

        result.campos = removerCampo(enums.codigo_interno.ampliacion, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_material_codigo_modelo = async (codigo_interno, material, result, length, length_borrador = 20, modelosEnSAP, tipo_carga) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && (campo.valor === '' || campo.valor.length > length)) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            campo.error = false;
            console.log(tipo_carga);
            console.log(modelosEnSAP);

            for (let index = 0; index < modelosEnSAP.length; index++) {
                const obj = modelosEnSAP[index];
                console.log(obj);
                if (obj.material_codigo_modelo === campo.valor) {
                    console.log('ramo:' + obj.ramo);
                    console.log('tipo_material:' + obj.tipo_material);
                    console.log('grupo_articulo:' + obj.grupo_articulo);
                    console.log('sector:' + obj.sector);
                    result.campos = removerCampo(enums.codigo_interno.ramo, result.campos);
                    result.campos.push({ codigo_interno: enums.codigo_interno.ramo, valor: obj.ramo, error: false });
                    result.campos = removerCampo(enums.codigo_interno.tipo_material, result.campos);
                    result.campos.push({ codigo_interno: enums.codigo_interno.tipo_material, valor: obj.tipo_material, error: false });
                    result.campos = removerCampo(enums.codigo_interno.grupo_articulo, result.campos);
                    result.campos.push({ codigo_interno: enums.codigo_interno.grupo_articulo, valor: obj.grupo_articulo, error: false });
                    result.campos = removerCampo(enums.codigo_interno.sector, result.campos);
                    result.campos.push({ codigo_interno: enums.codigo_interno.sector, valor: obj.sector, error: false });

                    break;
                }
            }
        }

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

function obtenerCampo(codigo_interno, campos) {
    let result = null;

    for (let index = 0; index < campos.length; index++) {
        const campo = campos[index];

        if (campo.codigo_interno === codigo_interno) {
            result = campo;
            break;
        }
    }

    return result;
};

function obtenerCampoValor(codigo_interno, campos) {
    let result = null;

    for (let index = 0; index < campos.length; index++) {
        const campo = campos[index];

        if (campo.codigo_interno === codigo_interno) {
            result = campo.valor;
            break;
        }
    }

    return result;
};

function obtenerCampoWithDefault(codigo_interno, campos, obj_material) {
    let campo = obtenerCampo(codigo_interno, campos);
    if (!campo) {
        if (codigo_interno === enums.codigo_interno.ampliacion) { campo = obj_material.ampliacion }
        if (codigo_interno === enums.codigo_interno.centro_codigo_sap) { campo = obj_material.centro_codigo_sap }
        if (codigo_interno === enums.codigo_interno.almacen_codigo_sap) { campo = obj_material.almacen_codigo_sap }
    }

    return campo;
};

function removerCampo(codigo_interno, campos) {
    const filtered = campos.filter(function (value, index, arr) {
        return value.codigo_interno !== codigo_interno;
    });

    return filtered
};

async function existeDenominacionEnSAP(denominacionesEnSAP, denominacion) {
    let flag = false;

    if (denominacionesEnSAP.codigo === 1) {
        if (denominacionesEnSAP.lista.length > 0) {
            denominacionesEnSAP.lista.forEach(coincidencia => {
                if (coincidencia.denominacion === denominacion) {
                    flag = true;
                }
            });
        }
    } else {
        flag = true;
    }

    return flag;
};

function existeDenominacionEnRequest(material_request, denominacion) {
    let count = 0;

    material_request.forEach(material => {
        const campo_denominacion = obtenerCampo(enums.codigo_interno.denominacion, material.campos);
        if (campo_denominacion.valor === denominacion) {
            const campo_ampliacion = obtenerCampo(enums.codigo_interno.ampliacion, material.campos);
            if (!campo_ampliacion || campo_ampliacion.valor === '') {
                count++;
            }
        }
    });

    return count > 1;
};

function existePadreEnRequest(material_request, denominacion, centro_codigo_sap, almacen_codigo_sap) {
    let flag = false;

    material_request.forEach(material => {
        const campo_denominacion = obtenerCampo(enums.codigo_interno.denominacion, material.campos);
        if (campo_denominacion.valor === denominacion) {
            const campo_centro = obtenerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
            if (campo_centro.valor !== centro_codigo_sap) {
                const campo_almacen = obtenerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);
                if (campo_almacen.valor !== almacen_codigo_sap) {
                    flag = true;
                    return;
                }
            }
        }
    });

    return flag;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

module.exports = validator;