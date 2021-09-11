const enums = require('../utils/enums');
const postgresConn = require('../connections/postgres');
const materialSolicitudService = require('../services/materialSolicitudService');

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

validator.validar_check = async (codigo_interno, material, result, length, length_borrador = 20) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && campo.valor.length > length) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        }
        else {
            if (campo.valor === 'x') {
                campo.valor === 'X'
            }

            if (campo.valor === '' || campo.valor === 'X') {
                campo.error = false;
            }
            else {
                campo.error = true;
            }
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
                    if (obj_material.denominacion !== campo.valor) {
                        console.log('update: cambio denominacion');
                        campo.error = false;
                        const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                        if (denominacionEnDb && denominacionEnDb.length > 0) {
                            campo.error = true;
                            campo.existeEnDb = true;
                        }
                        else {
                            var existeEnSap = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor);
                            campo.error = existeEnSap;
                            campo.existeEnSap = existeEnSap;
                        }
                    } else {
                        console.log('update: no cambio denominacion');
                        campo.error = false;

                        if (tipo_carga === enums.tipoCarga.individual) {
                            const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                            if (denominacionEnDb && denominacionEnDb.length > 1) {
                                campo.error = true;
                                campo.existeEnDb = true;
                            }
                        }
                    }
                } else {
                    console.log('insert');
                    campo.error = false;
                    const denominacionEnDb = await materialSolicitudService.listarPorDenominacion(postgresConn, campo.valor);
                    if (denominacionEnDb && denominacionEnDb.length > 0) {
                        campo.error = true;
                        campo.existeEnDb = true;
                    }
                    else {
                        var existeEnSap = await existeDenominacionEnSAP(denominacionesEnSAP, campo.valor);
                        campo.error = existeEnSap;
                        campo.existeEnSap = existeEnSap;
                    }
                }
            }
        }

        result.campos = removerCampo(enums.codigo_interno.denominacion, result.campos);
        result.campos.push(campo);
    }

    return result;
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


        if (material.id_material_solicitud) {
            console.log("Completar datos para: " + material.id_material_solicitud);
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

                            // if (db.ampliacion !== 'X') {
                            //     material.campos = removerCampo(enums.codigo_interno.ampliacion, material.campos);
                            //     material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });

                            //     campo_denominacion.error = false;
                            //     material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                            //     material.campos.push(campo_denominacion);
                            //     found = true;
                            //     break;
                            // } else {
                            //     campo_denominacion.error = true;
                            //     material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                            //     material.campos.push(campo_denominacion);
                            //     found = true;
                            //     break;
                            // }
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
            // Remover campos completados que sean nulos
            console.log(centro);
            if (!centro) {
                console.log('Remover centro_codigo_sap');
                material.campos = removerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
            }

            console.log(almacen);
            if (!almacen) {
                console.log('Remover almacen_codigo_sap');
                material.campos = removerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);
            }
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
                        if (material.index > rq.index) {
                            campo_denominacion.error = true;
                            material.campos = removerCampo(enums.codigo_interno.denominacion, material.campos);
                            material.campos.push(campo_denominacion);
                        }
                    } else {
                        console.log("rq: <> clave");

                        if (material.index > rq.index) {
                            console.log(rq_ampliacion);
                            if (rq_ampliacion !== 'X') {
                                console.log("rq: el otro es ampliacion");
                                material.campos = removerCampo(enums.codigo_interno.ampliacion, material.campos);
                                material.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });

                                campo_denominacion.error = campo_denominacion.existeEnDb ?? false;
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

        // Remover campos completados que sean nulos
        console.log(centro);
        if (!centro) {
            console.log('Remover centro_codigo_sap');
            material.campos = removerCampo(enums.codigo_interno.centro_codigo_sap, material.campos);
        }

        console.log(almacen);
        if (!almacen) {
            console.log('Remover almacen_codigo_sap');
            material.campos = removerCampo(enums.codigo_interno.almacen_codigo_sap, material.campos);
        }
    }

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

validator.validar_grupo_planif_necesidades = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        await asyncForEach(campo.valores, async (grupo_planif_necesidades) => {
            if (grupo_planif_necesidades.valor && grupo_planif_necesidades.valor.length > length) {
                grupo_planif_necesidades.valor = grupo_planif_necesidades.valor.substring(0, length_borrador);
                grupo_planif_necesidades.error = true;
            } else {
                // if (grupo_planif_necesidades.porDefecto) {
                //     grupo_planif_necesidades.error = false;
                // } else {
                if (list) {
                    let obj = list.filter(function (item) { return item.codigo_sap == grupo_planif_necesidades.valor })[0] || null;

                    if (obj) {
                        grupo_planif_necesidades.id = obj.codigo_sap;
                        grupo_planif_necesidades.error = false;
                    } else {
                        grupo_planif_necesidades.id = null;
                        grupo_planif_necesidades.error = true;
                    }
                } else {
                    grupo_planif_necesidades.error = false;
                }
                //}
            }
        });

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_modelo_pronostico = async (codigo_interno, material, result, length, length_borrador = 20, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        await asyncForEach(campo.valores, async (modelo_pronostico) => {
            if (modelo_pronostico.valor && modelo_pronostico.valor.length > length) {
                modelo_pronostico.valor = modelo_pronostico.valor.substring(0, length_borrador);
                modelo_pronostico.error = true;
            } else {
                // if (modelo_pronostico.porDefecto) {
                //     modelo_pronostico.error = false;
                // } else {
                if (list) {
                    let obj = list.filter(function (item) { return item.codigo_sap == modelo_pronostico.valor })[0] || null;

                    if (obj) {
                        modelo_pronostico.id = obj.id_modelo_pronostico;
                        modelo_pronostico.error = false;
                    } else {
                        modelo_pronostico.id = null;
                        modelo_pronostico.error = true;
                    }
                } else {
                    modelo_pronostico.error = false;
                }
                //}
            }
        });

        result.campos = removerCampo(codigo_interno, result.campos);
        result.campos.push(campo);
    }

    return result;
};

validator.validar_nivel_servicio = async (codigo_interno, material, result, list) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        await asyncForEach(campo.valores, async (nivel_servicio) => {
            if (!nivel_servicio.valor) {
                nivel_servicio.error = true;
            } else {
                if (isNaN(nivel_servicio.valor)) {
                    nivel_servicio.error = true;
                } else {
                    const longitud = list.filter(function (item) { return item.codigo_interno == codigo_interno })[0] || null;

                    if (longitud) {
                        nivel_servicio.valor = Math.trunc(nivel_servicio.valor * Math.pow(10, longitud.decimals)) / Math.pow(10, longitud.decimals)
                    }

                    nivel_servicio.error = false;
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

validator.validar_material_codigo_modelo = async (codigo_interno, material, result, length, length_borrador = 20, modelosEnSAP, tipo_carga) => {
    const campo = obtenerCampo(codigo_interno, material.campos);

    if (campo) {
        console.log('validar_' + codigo_interno);

        if (campo.valor && (campo.valor === '' || campo.valor.length > length)) {
            campo.valor = campo.valor.substring(0, length_borrador);
            campo.error = true;
        } else {
            campo.error = false;
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
            for (let index = 0; index < denominacionesEnSAP.length; index++) {
                const coincidencia = denominacionesEnSAP[index];

                if (coincidencia.denominacion === denominacion) {
                    flag = true;
                    break;
                }
            }
        }
    } else {
        flag = true;
    }

    return flag;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

module.exports = validator;