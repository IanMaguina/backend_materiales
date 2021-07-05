//#region requires
const winston = require('../utils/winston');
const postgresConn = require('../connections/postgres');
const constantes = require('../utils/constantes');
const enums = require('../utils/enums');
const cpsaaApiProvider = require('../providers/cpsaaApiProvider');
const materialValidator = require('../utils/materialValidator');

const solicitudService = require('../services/solicitudService');
const materialSolicitudService = require('../services/materialSolicitudService');
const campoService = require('../services/campoService');
const aprobadorSolicitudService = require('../services/aprobadorSolicitudService');
const vistaPortalService = require('../services/vistaPortalService');
const equivalenciaMaterialService = require('../services/equivalenciaMaterialService');

const ramoService = require('../services/ramoService');
const unidadMedidaService = require('../services/unidadMedidaService');
const partidaArancelariaService = require('../services/partidaArancelariaService');
const centroService = require('../services/centroService');
const centroBeneficioService = require('../services/centroBeneficioService');
const almacenService = require('../services/almacenService');
const organizacionVentaService = require('../services/organizacionVentaService');
const canalDistribucionService = require('../services/canalDistribucionService');
const clasificacionService = require('../services/clasificacionService');
const clasificacionMaterialService = require('../services/clasificacionMaterialService');
const tipoMaterialService = require('../services/tipoMaterialService');
const grupoArticuloService = require('../services/grupoArticuloService');
const grupoTipoPosicionService = require('../services/grupoTipoPosicionService');
const textoCompraService = require('../services/textoCompraService');
const grupoEstadisticaMatService = require('../services/grupoEstadisticaMatService');
const grupoImputacionMaterialService = require('../services/grupoImputacionMaterialService');
const jerarquiaProductoService = require('../services/jerarquiaProductoService');
const grupoMaterial1Service = require('../services/grupoMaterial1Service');
const grupoMaterial2Service = require('../services/grupoMaterial2Service');
const textoComercialService = require('../services/textoComercialService');
const verificacionDisponibilidadService = require('../services/verificacionDisponibilidadService');
const grupoTransporteService = require('../services/grupoTransporteService');
const grupoCargaService = require('../services/grupoCargaService');
const grupoCompraService = require('../services/grupoCompraService');
const categoriaValoracionService = require('../services/categoriaValoracionService');
const controlPrecioService = require('../services/controlPrecioService');
const determinacionPrecioService = require('../services/determinacionPrecioService');
const grupoPlanifNecesidadesService = require('../services/grupoPlanifNecesidadesService');
const tipoMrpCaractPlaniService = require('../services/tipoMrpCaractPlaniService');
const planifNecesidadesService = require('../services/planifNecesidadesService');
const calculoTamanoLoteService = require('../services/calculoTamanoLoteService');
const claseAprovisService = require('../services/claseAprovisService');
const aprovisEspecialService = require('../services/aprovisEspecialService')
const tomaRetrogradaService = require('../services/tomaRetrogradaService');
const claveHorizonteService = require('../services/claveHorizonteService');
const indicadorPeriodoService = require('../services/indicadorPeriodoService');
const grupoEstrategiaService = require('../services/grupoEstrategiaService');
const planfNecesMixtasService = require('../services/planfNecesMixtasService');
const individualColectivoService = require('../services/individualColectivoService');
const responsableControlProduccionService = require('../services/responsableControlProduccionService');
const perfilControlFabricacionService = require('../services/perfilControlFabricacionService');
const claseInspeccionService = require('../services/claseInspeccionService');
const claseInspeccionMaterialService = require('../services/claseInspeccionMaterialService');
const modeloPronosticoService = require('../services/modeloPronosticoService');
const idiomaService = require('../services/idiomaService');
const inicializacionService = require('../services/inicializacionService');
const gradoOptimizacionService = require('../services/gradoOptimizacionService');
const procSelModeloService = require('../services/procSelModeloService');

const anexoMaterialService = require('../services/anexoMaterialService');
const areaPlanificacionService = require('../services/areaPlanificacionService');
const areaPlanificacionMaterialService = require('../services/areaPlanificacionMaterialService');

const { validar_codigo_sap, validar_texto } = require('../utils/materialValidator');
const validator = require('../utils/materialValidator');
const { cpsaaSapApi } = require('../config');
//#endregion

const controller = { internal: {}, external: {} };

//#region Funciones públicas invocadas por el router
controller.external.listar = async (req, res) => {

    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Materiales."
        };

        const { id_solicitud } = req.params;

        const result = await listar(id_solicitud);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = result;
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.listar. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.obtenerMaterial = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Material."
        };

        const { id_solicitud, id_material_solicitud } = req.params;

        const result = await obtener(id_solicitud, id_material_solicitud);

        if (result) {
            response.resultado = 1;
            response.mensaje = "";
            response.lista = [];
            response.lista.push(result);
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.obtenerMaterial. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.agregarMaterial = async (req, res) => {
    const client = await postgresConn.getClient();

    try {

        const response = {
            resultado: 0, mensaje: "Error inesperado al agregar Materiales."
        };

        const { id_solicitud } = req.params;
        const { material } = req.body;

        //#region Validaciones al request
        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!material) {
            response.resultado = 0;
            response.mensaje = "El campo material no puede ser nulo y debe contener campos";
            res.status(200).json(response);
            return;
        }

        const solicitud = await solicitudService.obtenerParaValidar(postgresConn, id_solicitud);
        if (!solicitud) {
            response.resultado = 0;
            response.mensaje = "No existe el id_solicitud enviado {" + id_solicitud + "}";
            res.status(200).json(response);
            return;
        }
        //#endregion        

        const materiales = [];
        materiales.push(material);
        const materialesValidados = await validarMateriales(id_solicitud, materiales, enums.tipoCarga.individual, false);
        const materialValidado = materialesValidados[0];

        await client.query("BEGIN");
        const resultOriginal = await materialSolicitudService.crear(client, id_solicitud, materialValidado);
        const id_material_solicitud = resultOriginal[0].id;
        const resultBorrador = await materialSolicitudService.crearBorrador(client, id_solicitud, id_material_solicitud, materialValidado);

        //#region Agregar tablas
        const clasificacion_tab = obtenerCampo(enums.codigo_interno.clasificacion_tab, materialValidado.campos);
        if (clasificacion_tab) {
            await asyncForEach(clasificacion_tab.valores, async (clasificacion) => {
                await clasificacionMaterialService.crear(client, id_material_solicitud, clasificacion.id, clasificacion.valor, clasificacion.error);
            });
        }

        const clase_inspeccion_tab = obtenerCampo(enums.codigo_interno.clase_inspeccion_tab, materialValidado.campos);
        if (clase_inspeccion_tab) {
            await asyncForEach(clase_inspeccion_tab.valores, async (clase_inspeccion) => {
                await claseInspeccionMaterialService.crear(client, id_material_solicitud, clase_inspeccion.id, clase_inspeccion.valor, clase_inspeccion.error);
            });
        }

        const area_planificacion_tab = obtenerCampo(enums.codigo_interno.area_planificacion_tab, materialValidado.campos);
        if (area_planificacion_tab) {
            await asyncForEach(area_planificacion_tab.valores, async (area_planificacion) => {
                await areaPlanificacionMaterialService.crear(client, id_material_solicitud, area_planificacion.id, area_planificacion.valor, area_planificacion.error);
            });
        }
        //#endregion

        await client.query('COMMIT');
        const obtenerMaterial = await obtener(id_solicitud, id_material_solicitud);

        response.resultado = 1;
        response.mensaje = "";
        response.lista = [];
        response.lista.push(obtenerMaterial);

        res.status(200).json(response);

    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en materialSolicitudController.external.agregarMaterial. Details: ", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
};

controller.external.agregarMateriales = async (req, res) => {
    const client = await postgresConn.getClient();

    try {
        const response = {
            resultado: 0, mensaje: "Error inesperado al agregar Materiales."
        };

        const { id_solicitud } = req.params;
        const { id_usuario } = req.query;
        const { materiales } = req.body;

        //#region Validaciones al request
        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!id_usuario || id_usuario == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_usuario no tiene un valor válido. Tipo de dato : '" + (typeof id_usuario) + "', valor = " + id_usuario;
            res.status(200).json(response);
            return;
        }

        const aprobador_solicitud = aprobadorSolicitudService.listarParaValidar(postgresConn, id_solicitud, id_usuario);
        if (aprobador_solicitud.length === 0) {
            response.resultado = 0;
            response.mensaje = "Usuario inválido para registrar materiales";
            res.status(200).json(response);
            return;
        }

        if (!materiales) {
            response.resultado = 0;
            response.mensaje = "El campo materiales no puede ser nulo";
            res.status(200).json(response);
            return;
        }

        const solicitud = await solicitudService.obtenerParaValidar(postgresConn, id_solicitud);
        if (!solicitud) {
            response.resultado = 0;
            response.mensaje = "No existe el id_solicitud enviado {" + id_solicitud + "}";
            res.status(200).json(response);
            return;
        }

        var id_materiales_request = materiales
            .filter(function (item) { return item.id_material_solicitud; })
            .map(function (item) {
                return item.id_material_solicitud;
            });;

        if (id_materiales_request.length > 0) {
            const id_materiales_db = await materialSolicitudService.listarIdMaterialesParaValidar(postgresConn, id_solicitud, id_materiales_request);
            if (id_materiales_db.length !== id_materiales_request.length) {
                response.resultado = 0;
                response.mensaje = "Existen id de materiales inválidos";
                response.carga_masiva = false;
                res.status(200).json(response);
                return;
            }
        }
        //#endregion

        const materialesValidados = await validarMateriales(id_solicitud, materiales, enums.tipoCarga.masivo, false);

        await client.query("BEGIN");

        await asyncForEach(materialesValidados, async (materialValidado) => {

            let id_material_solicitud = materialValidado.id_material_solicitud || 0;

            if (id_material_solicitud === 0) {

                const resultOriginal = await materialSolicitudService.crear(client, id_solicitud, materialValidado);
                id_material_solicitud = resultOriginal[0].id;
                const resultBorrador = await materialSolicitudService.crearBorrador(client, id_solicitud, id_material_solicitud, materialValidado);

            } else {

                await materialSolicitudService.actualizar(client, id_material_solicitud, materialValidado);
                await materialSolicitudService.actualizarBorrador(client, id_material_solicitud, materialValidado);

                const clasificacion_tab = obtenerCampo(enums.codigo_interno.clasificacion_tab, materialValidado.campos);
                if (clasificacion_tab) {
                    await clasificacionMaterialService.eliminarPorMaterial(client, id_material_solicitud);
                }

                const clase_inspeccion_tab = obtenerCampo(enums.codigo_interno.clase_inspeccion_tab, materialValidado.campos);
                if (clase_inspeccion_tab) {
                    await claseInspeccionMaterialService.eliminarPorMaterial(client, id_material_solicitud);
                }

                const area_planificacion_tab = obtenerCampo(enums.codigo_interno.area_planificacion_tab, materialValidado.campos);
                if (area_planificacion_tab) {
                    await areaPlanificacionMaterialService.eliminarPorMaterial(client, id_material_solicitud);
                }
            }

            //#region Agregar tablas
            const clasificacion_tab = obtenerCampo(enums.codigo_interno.clasificacion_tab, materialValidado.campos);
            if (clasificacion_tab) {
                await asyncForEach(clasificacion_tab.valores, async (clasificacion) => {
                    await clasificacionMaterialService.crear(client, id_material_solicitud, clasificacion.id, clasificacion.valor, clasificacion.error);
                });
            }

            const clase_inspeccion_tab = obtenerCampo(enums.codigo_interno.clase_inspeccion_tab, materialValidado.campos);
            if (clase_inspeccion_tab) {
                await asyncForEach(clase_inspeccion_tab.valores, async (clase_inspeccion) => {
                    await claseInspeccionMaterialService.crear(client, id_material_solicitud, clase_inspeccion.id, clase_inspeccion.valor, clase_inspeccion.error);
                });
            }

            const area_planificacion_tab = obtenerCampo(enums.codigo_interno.area_planificacion_tab, materialValidado.campos);
            if (area_planificacion_tab) {
                await asyncForEach(area_planificacion_tab.valores, async (area_planificacion) => {
                    await areaPlanificacionMaterialService.crear(client, id_material_solicitud, area_planificacion.id, area_planificacion.valor, area_planificacion.error);
                });
            }
            //#endregion
        });

        await client.query('COMMIT');
        const obtenerMateriales = await listar(id_solicitud);

        response.resultado = 1;
        response.mensaje = "";
        response.carga_masiva = true;
        response.lista = obtenerMateriales;

        res.status(200).json(response);

    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en materialSolicitudController.external.agregarMateriales. Details: ", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
};

controller.external.actualizarMaterial = async (req, res) => {
    const client = await postgresConn.getClient();

    try {

        const response = {
            resultado: 0, mensaje: "Error inesperado al agregar Materiales."
        };

        const { id_solicitud, id_material_solicitud } = req.params;
        const { material } = req.body;

        //#region Validaciones al request
        if (!id_material_solicitud || id_material_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_material_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_material_solicitud) + "', valor = " + id_material_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!material) {
            response.resultado = 0;
            response.mensaje = "El campo material no puede ser nulo";
            res.status(200).json(response);
            return;
        }

        const solicitud = await solicitudService.obtenerParaValidar(postgresConn, id_solicitud);
        if (!solicitud) {
            response.resultado = 0;
            response.mensaje = "No exiiste el id_solicitud enviado {" + id_solicitud + "}";
            res.status(200).json(response);
            return;
        }
        //#endregion

        const materialDb = await materialSolicitudService.obtenerParaValidar(postgresConn, id_material_solicitud);

        if (materialDb) {
            const materiales = [];
            material.id_material_solicitud = id_material_solicitud;
            materiales.push(material);
            const materialesValidados = await validarMateriales(id_solicitud, materiales, enums.tipoCarga.individual, false);
            const materialValidado = materialesValidados[0];

            await client.query("BEGIN");

            await materialSolicitudService.actualizar(client, id_material_solicitud, materialValidado);
            await materialSolicitudService.actualizarBorrador(client, id_material_solicitud, materialValidado);

            //#region Agregar tablas
            const clasificacion_tab = obtenerCampo(enums.codigo_interno.clasificacion_tab, materialValidado.campos);
            if (clasificacion_tab) {
                await clasificacionMaterialService.eliminarPorMaterial(client, id_material_solicitud);
                await asyncForEach(clasificacion_tab.valores, async (clasificacion) => {
                    await clasificacionMaterialService.crear(client, id_material_solicitud, clasificacion.id, clasificacion.valor, clasificacion.error);
                });
            }

            const clase_inspeccion_tab = obtenerCampo(enums.codigo_interno.clase_inspeccion_tab, materialValidado.campos);
            if (clase_inspeccion_tab) {
                await claseInspeccionMaterialService.eliminarPorMaterial(client, id_material_solicitud);
                await asyncForEach(clase_inspeccion_tab.valores, async (clase_inspeccion) => {
                    await claseInspeccionMaterialService.crear(client, id_material_solicitud, clase_inspeccion.id, clase_inspeccion.valor, clase_inspeccion.error);
                });
            }

            const area_planificacion_tab = obtenerCampo(enums.codigo_interno.area_planificacion_tab, materialValidado.campos);
            if (area_planificacion_tab) {
                await areaPlanificacionMaterialService.eliminarPorMaterial(client, id_material_solicitud);
                await asyncForEach(area_planificacion_tab.valores, async (area_planificacion) => {
                    await areaPlanificacionMaterialService.crear(client, id_material_solicitud, area_planificacion.id, area_planificacion.valor, area_planificacion.error);
                });
            }
            //#endregion

            await client.query('COMMIT');
            const obtenerMaterial = await obtener(id_solicitud, id_material_solicitud);

            response.resultado = 1;
            response.mensaje = "";
            response.lista = [];
            response.lista.push(obtenerMaterial);

            res.status(200).json(response);
        } else {
            response.mensaje = "No se encontró el material para actualizar";
            res.status(404).send(response);
        }
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en materialSolicitudController.external.actualizarMaterial. Details: ", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
};

controller.external.eliminarMaterial = async (req, res) => {
    const client = await postgresConn.getClient();

    try {
        const response = {
            resultado: 0, mensaje: "Error inesperado al eliminar Material."
        };

        const { id_solicitud, id_material_solicitud } = req.params;

        const material = await materialSolicitudService.obtenerParaEliminar(postgresConn, id_material_solicitud);

        if (material) {

            await client.query("BEGIN");

            await materialSolicitudService.eliminarBorradorPorMaterial(client, id_material_solicitud);

            /* Eliminar tablas */
            await clasificacionMaterialService.eliminarPorMaterial(client, id_material_solicitud);

            await claseInspeccionMaterialService.eliminarPorMaterial(client, id_material_solicitud);

            await areaPlanificacionMaterialService.eliminarPorMaterial(client, id_material_solicitud);

            await textoComercialService.eliminarPorMaterial(client, id_material_solicitud);

            await textoCompraService.eliminarPorMaterial(client, id_material_solicitud);

            await materialSolicitudService.eliminarPorMaterial(client, id_material_solicitud);

            if (material.ampliacion !== 'X') {
                /* Obtener ampliaciones de la que es padre*/
                const hijos = await materialSolicitudService.listarHijosParaEliminar(postgresConn, material.id_solicitud, material.denominacion, material.centro_codigo_sap, material.almacen_codigo_sap);

                if (hijos) {

                    await asyncForEach(hijos, async (element) => {
                        await materialSolicitudService.eliminarBorradorPorMaterial(client, element.id);

                        /* Eliminar tablas */
                        await clasificacionMaterialService.eliminarPorMaterial(client, element.id);

                        await claseInspeccionMaterialService.eliminarPorMaterial(client, element.id);

                        await areaPlanificacionMaterialService.eliminarPorMaterial(client, element.id);

                        await textoComercialService.eliminarPorMaterial(client, element.id);

                        await textoCompraService.eliminarPorMaterial(client, element.id);

                        await materialSolicitudService.eliminarPorMaterial(client, element.id);
                    });
                }
            }

            await client.query('COMMIT');

            response.resultado = 1;
            response.mensaje = "";

            res.status(200).json(response);
        } else {
            response.mensaje = "No se encontró el Material para eliminar";
            res.status(404).send(response);
        }
    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en materialSolicitudController.external.eliminarMaterial. Details: ", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
};

controller.external.consultaNombreMaterialSAP = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al consultar el nombre del material."
        };

        const { denominacion } = req.query;

        //#region Validaciones al request
        if (!denominacion || denominacion == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo denominacion no tiene un valor válido. Tipo de dato : '" + (typeof denominacion) + "', valor = " + denominacion;
            res.status(200).json(response);
            return;
        }
        //#endregion

        const result = await cpsaaApiProvider.consultarNombreMaterial([denominacion]);

        response.resultado = result.codigo;
        response.mensaje = result.mensaje;
        response.lista = result.lista;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.consultaNombreMaterialSAP. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.consultaCodigoMaterialSAP = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al consultar el código del material."
        };

        const { material } = req.body;

        //#region Validaciones al request
        if (!material) {
            response.resultado = 0;
            response.mensaje = "El campo material no puede ser nulo";
            res.status(200).json(response);
            return;
        }
        //#endregion

        const result = await cpsaaApiProvider.consultarCodigoMaterial(material);

        response.resultado = result.codigo;
        response.mensaje = result.mensaje;
        response.lista = result.lista;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.consultaCodigoMaterialSAP. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.existeDenominacion = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al validar si existe la denominación."
        };

        const { denominacion } = req.query;

        //#region Validaciones al request
        if (!denominacion || denominacion == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo denominacion no tiene un valor válido. Tipo de dato : '" + (typeof denominacion) + "', valor = " + denominacion;
            res.status(200).json(response);
            return;
        }
        //#endregion

        const result = await cpsaaApiProvider.consultarNombreMaterial([denominacion]);
        let nombresExistentes = [];
        if (result.codigo == 1) {
            nombresExistentes = result.lista;
        }

        const existeDenominacion = existeDenominacionExacta(nombresExistentes, denominacion)

        response.resultado = 1;
        response.mensaje = "";
        response.existe = existeDenominacion;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.validarDenominacion. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.existeDenominacionEnDb = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al validar si existe la denominación en Base de Datos."
        };

        const { denominacion } = req.query;

        //#region Validaciones al request       

        if (!denominacion || denominacion == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo denominacion no tiene un valor válido. Tipo de dato : '" + (typeof denominacion) + "', valor = " + denominacion;
            res.status(200).json(response);
            return;
        }
        //#endregion

        const nombresExistentes = await materialSolicitudService.listarPorDenominacion(postgresConn, denominacion);

        response.resultado = 1;
        response.mensaje = "";
        response.existe = nombresExistentes.length > 0;
        response.lista = nombresExistentes;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.existeDenominacionEnDb. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.existePadreAmpliacion = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al validar si existe la padre de ampliación en Base de Datos."
        };

        const { id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap } = req.query;

        //#region Validaciones al request       

        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!denominacion || denominacion == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo denominacion no tiene un valor válido. Tipo de dato : '" + (typeof denominacion) + "', valor = " + denominacion;
            res.status(200).json(response);
            return;
        }

        if (!centro_codigo_sap || centro_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo centro_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof centro_codigo_sap) + "', valor = " + centro_codigo_sap;
            res.status(200).json(response);
            return;
        }

        if (!almacen_codigo_sap || almacen_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo almacen_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof almacen_codigo_sap) + "', valor = " + almacen_codigo_sap;
            res.status(200).json(response);
            return;
        }
        //#endregion

        const posiblesPadres = await materialSolicitudService.listarPosiblesPadres(postgresConn, id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap);

        response.resultado = 1;
        response.mensaje = "";
        response.existe = posiblesPadres.length > 0;
        response.lista = posiblesPadres;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.existePadreAmpliacion. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.esPadre = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al validar si existe la padre de ampliación en Base de Datos."
        };

        const { id_solicitud, denominacion } = req.query;

        //#region Validaciones al request       

        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!denominacion || denominacion == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo denominacion no tiene un valor válido. Tipo de dato : '" + (typeof denominacion) + "', valor = " + denominacion;
            res.status(200).json(response);
            return;
        }


        //#endregion

        const count = await materialSolicitudService.esPadre(postgresConn, id_solicitud, denominacion);

        response.resultado = 1;
        response.mensaje = "";
        response.existe = count[0]['count'] > 0;


        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.esPadre. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.existeHijosAmpliacion = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al validar si existe Hijos de ampliación en Base de Datos."
        };

        const { id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap } = req.query;

        //#region Validaciones al request       

        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!denominacion || denominacion == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo denominacion no tiene un valor válido. Tipo de dato : '" + (typeof denominacion) + "', valor = " + denominacion;
            res.status(200).json(response);
            return;
        }

        if (!centro_codigo_sap || centro_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo centro_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof centro_codigo_sap) + "', valor = " + centro_codigo_sap;
            res.status(200).json(response);
            return;
        }

        if (!almacen_codigo_sap || almacen_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo almacen_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof almacen_codigo_sap) + "', valor = " + almacen_codigo_sap;
            res.status(200).json(response);
            return;
        }
        //#endregion

        const posiblesPadres = await materialSolicitudService.listarHijos(postgresConn, id_solicitud, denominacion, centro_codigo_sap, almacen_codigo_sap);

        response.resultado = 1;
        response.mensaje = "";
        response.existe = posiblesPadres.length > 0;
        response.lista = posiblesPadres;

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.existeHijosAmpliacion. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.enviarSAP = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al enviar solicitud a SAP."
        };

        const { id_solicitud } = req.params;

        const result = await enviarSAP(id_solicitud);

        response.resultado = result.codigo;

        if (result.codigo === 1) {
            response.mensaje = "Envío satisfactorio";
        } else {
            response.mensaje = JSON.stringify(result.mensaje);
        }

        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en materialSolicitudController.external.enviarSAP. Details: ", error);
        res.status(500).send(error);
    }
};

controller.external.crearAmpliacion = async (req, res) => {
    const client = await postgresConn.getClient();

    try {

        const response = {
            resultado: 0, mensaje: "Error inesperado al crear Ampliación."
        };

        const { id_solicitud } = req.params;
        const { material_codigo_sap, material } = req.body;

        //#region Validaciones
        if (!id_solicitud || id_solicitud == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo id_solicitud no tiene un valor válido. Tipo de dato : '" + (typeof id_solicitud) + "', valor = " + id_solicitud;
            res.status(200).json(response);
            return;
        }

        if (!material_codigo_sap || material_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo material_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof material_codigo_sap) + "', valor = " + material_codigo_sap;
            res.status(200).json(response);
            return;
        }

        if (!material) {
            response.resultado = 0;
            response.mensaje = "El campo material no puede ser nulo y debe contener campos";
            res.status(200).json(response);
            return;
        }

        if (!material.campos || material.campos.length === 0) {
            response.resultado = 0;
            response.mensaje = "El material debe contener campos";
            res.status(200).json(response);
            return;
        }

        const centro_codigo_sap = obtenerCampoValor(enums.codigo_interno.centro_codigo_sap, material.campos);
        if (!centro_codigo_sap || centro_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo centro_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof centro_codigo_sap) + "', valor = " + centro_codigo_sap;
            res.status(200).json(response);
            return;
        }

        const almacen_codigo_sap = obtenerCampoValor(enums.codigo_interno.almacen_codigo_sap, material.campos);
        if (!almacen_codigo_sap || almacen_codigo_sap == constantes.emptyString) {
            response.resultado = 0;
            response.mensaje = "El campo almacen_codigo_sap no tiene un valor válido. Tipo de dato : '" + (typeof almacen_codigo_sap) + "', valor = " + almacen_codigo_sap;
            res.status(200).json(response);
            return;
        }

        const solicitud = await solicitudService.obtenerParaValidar(postgresConn, id_solicitud);
        if (!solicitud) {
            response.resultado = 0;
            response.mensaje = "No existe el id_solicitud enviado {" + id_solicitud + "}";
            res.status(200).json(response);
            return;
        }
        //#endregion

        const request_sap_por_codigo = {
            codigo: material_codigo_sap,
            centro: centro_codigo_sap,
            almacen: almacen_codigo_sap,
            organizacion_ventas: obtenerCampoValor(enums.codigo_interno.organizacion_ventas, material.campos),
            canal_distribucion: obtenerCampoValor(enums.codigo_interno.canal_distribucion, material.campos),
            area_planificacion: obtenerCampoValor(enums.codigo_interno.area_planificacion_tab, material.campos)
        }
        const response_sap_por_codigo = await cpsaaApiProvider.consultarCodigoMaterial(request_sap_por_codigo);

        if (response_sap_por_codigo.codigo === 0) {
            response.resultado = 0;
            response.mensaje = "No existe el material_codigo_sap enviado {" + material_codigo_sap + "}";
            res.status(200).json(response);
            return;
        }

        // const request_sap_por_nombre = [obtenerCampoValor(enums.codigo_interno.denominacion, response_sap_por_codigo.lista)];
        // const response_sap_por_nombre = await cpsaaApiProvider.consultarNombreMaterial(request_sap_por_nombre);
        // let nombresExistentes = [];
        // if (response_sap_por_nombre.codigo == 1) {
        //     nombresExistentes = response_sap_por_nombre.lista;
        // }

        // const existeDenominacion = existeDenominacionExacta(nombresExistentes, denominacion)

        const denominacion_en_sap = obtenerCampoValor(enums.codigo_interno.denominacion, response_sap_por_codigo.lista);
        const denominacion_en_request = obtenerCampoValor(enums.codigo_interno.denominacion, material.campos);

        console.log('denominacion_en_sap: ' + denominacion_en_sap);
        console.log('denominacion_en_request: ' + denominacion_en_request);

        if (denominacion_en_sap != denominacion_en_request) {
            response.resultado = 0;
            response.mensaje = "La denominacion del material enviado no coincide con el material en SAP";
            res.status(200).json(response);
            return;
        }

        // Validar existe en sap
        const sap_amp_key = obtenerCampoValor(enums.codigo_interno.centro_codigo_sap, response_sap_por_codigo.lista) + '-' + obtenerCampoValor(enums.codigo_interno.almacen_codigo_sap, response_sap_por_codigo.lista);
        const request_amp_key = centro_codigo_sap + '-' + almacen_codigo_sap;

        console.log('sap_amp_key: ' + sap_amp_key);
        console.log('request_amp_key: ' + request_amp_key);

        if (sap_amp_key === request_amp_key) {
            response.resultado = 0;
            response.mensaje = "El centro_codigo_sap + almacen_codigo_sap debe ser diferente para la ampliación.";
            res.status(200).json(response);
            return;
        }

        // Validar existe en tramite
        const denominacion_en_db = await materialSolicitudService.listarPorDenominacionParaAmpliacion(postgresConn, denominacion_en_sap);
        
        console.log('denominacion_en_db: ');
        console.log(denominacion_en_db);

        if (denominacion_en_db) {
            const response_db=denominacion_en_db[0]
            const db_amp_key = response_db.centro_codigo_sap + '-' + response_db.almacen_codigo_sap;
            console.log('request_amp_key: ' + request_amp_key);
            console.log('db_amp_key: ' + db_amp_key);
            if (request_amp_key === db_amp_key) {
                response.resultado = 0;
                response.mensaje = "Ya existe una ampliacion en trámite para los datos solicitados.";
                res.status(200).json(response);
                return;
            }
        }

        const nuevoMaterial = { campos: response_sap_por_codigo.lista };
        material.campos.forEach(element => {
            nuevoMaterial.campos = removerCampo(element.codigo_interno, nuevoMaterial.campos);
            nuevoMaterial.campos.push(element);
        });


        const materiales = [];
        materiales.push(nuevoMaterial);
        const materialesValidados = await validarMateriales(id_solicitud, materiales, enums.tipoCarga.individual, true);
        const materialValidado = materialesValidados[0];

        await client.query("BEGIN");
        const resultOriginal = await materialSolicitudService.crear(client, id_solicitud, materialValidado);
        const id_material_solicitud = resultOriginal[0].id;
        const resultBorrador = await materialSolicitudService.crearBorrador(client, id_solicitud, id_material_solicitud, materialValidado);

        //#region Agregar tablas
        const clasificacion_tab = obtenerCampo(enums.codigo_interno.clasificacion_tab, materialValidado.campos);
        if (clasificacion_tab) {
            await asyncForEach(clasificacion_tab.valores, async (clasificacion) => {
                await clasificacionMaterialService.crear(client, id_material_solicitud, clasificacion.id, clasificacion.valor, clasificacion.error);
            });
        }

        const clase_inspeccion_tab = obtenerCampo(enums.codigo_interno.clase_inspeccion_tab, materialValidado.campos);
        if (clase_inspeccion_tab) {
            await asyncForEach(clase_inspeccion_tab.valores, async (clase_inspeccion) => {
                await claseInspeccionMaterialService.crear(client, id_material_solicitud, clase_inspeccion.id, clase_inspeccion.valor, clase_inspeccion.error);
            });
        }

        const area_planificacion_tab = obtenerCampo(enums.codigo_interno.area_planificacion_tab, materialValidado.campos);
        if (area_planificacion_tab) {
            await asyncForEach(area_planificacion_tab.valores, async (area_planificacion) => {
                await areaPlanificacionMaterialService.crear(client, id_material_solicitud, area_planificacion.id, area_planificacion.valor, area_planificacion.error);
            });
        }
        //#endregion

        await client.query('COMMIT');
        const obtenerMaterial = await obtener(id_solicitud, id_material_solicitud);

        response.resultado = 1;
        response.mensaje = "";
        response.lista = [];
        response.lista.push(obtenerMaterial);

        res.status(200).json(response);

    } catch (error) {
        await client.query("ROLLBACK");
        winston.info("Error en materialSolicitudController.external.crearAmpliacion. Details: ", error);
        res.status(500).send(error);
    } finally {
        client.release();
    }
};
//#endregion
//#region Funciones públicas invocadas por otros controllers
controller.internal.obtener = async (id_solicitud, id_material_solicitud) => {
    return await obtener(id_solicitud, id_material_solicitud);
};

controller.internal.listar = async (id_solicitud) => {
    return await listar(id_solicitud);
};

controller.internal.eliminarPorSolicitud = async (client, id_solicitud) => {

    try {

        await materialSolicitudService.eliminarBorradorPorSolicitud(client, id_solicitud);

        /* Eliminar tablas */
        await clasificacionMaterialService.eliminarPorSolicitud(client, id_solicitud);
        await claseInspeccionMaterialService.eliminarPorSolicitud(client, id_solicitud);
        await areaPlanificacionMaterialService.eliminarPorSolicitud(client, id_solicitud);
        await textoComercialService.eliminarPorSolicitud(client, id_solicitud);
        await textoCompraService.eliminarPorSolicitud(client, id_solicitud);

        await materialSolicitudService.eliminarPorSolicitud(client, id_solicitud);

    } catch (error) {
        winston.info("Error en materialSolicitudController.internal.eliminar. Details: ", error);
        throw error;
    }
};

controller.internal.enviarSAP = async (id_solicitud) => {
    const response = {
        resultado: 0,
        mensaje: "Error inesperado al enviar solicitud a SAP."
    };

    const result = await enviarSAP(id_solicitud);

    response.resultado = result.codigo;

    if (result.codigo === 1) {
        response.mensaje = "Envío satisfactorio";
    } else {
        response.mensaje = JSON.stringify(result.mensaje);
    }

    return response;
};
//#endregion
//#region Funciones privadas
async function obtener(id_solicitud, id_material_solicitud) {
    let rep = {
        id_solicitud: id_solicitud,
        id_material_solicitud: id_material_solicitud
    };

    try {
        const material = await materialSolicitudService.obtener(postgresConn, id_material_solicitud);

        if (material) {

            const list_campos = await campoService.listarCamposVisibles(postgresConn, id_solicitud);
            /* No obtener por solicitud sino por material */
            const list_clasificacion = await clasificacionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);
            const list_clase_inspeccion = await claseInspeccionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);
            const list_area_planificacion = await areaPlanificacionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);

            rep = obtenerCamposVisibles(rep, material, list_campos, list_clasificacion, list_clase_inspeccion, list_area_planificacion);
        }
    } catch (error) {
        winston.info("Error en materialSolicitudController.obtener. Details: ", error);
    }

    return rep;
};

async function listar(id_solicitud) {
    const result = [];

    try {
        const materiales = await materialSolicitudService.listar(postgresConn, id_solicitud);

        if (materiales && materiales.length > 0) {

            const list_campos = await campoService.listarCamposVisibles(postgresConn, id_solicitud);
            const list_clasificacion = await clasificacionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);
            const list_clase_inspeccion = await claseInspeccionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);
            const list_area_planificacion = await areaPlanificacionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);

            materiales.forEach(material => {
                let rep = {
                    id_solicitud: id_solicitud,
                    id_material_solicitud: material.id_material_solicitud
                };

                rep = obtenerCamposVisibles(rep, material, list_campos, list_clasificacion, list_clase_inspeccion, list_area_planificacion);

                result.push(rep);
            });
        }
    } catch (error) {
        winston.info("Error en materialSolicitudController.listar. Details: ", error);
    }

    return result;
};

async function enviarSAP(id_solicitud) {
    try {
        let solicitud = {
            id: id_solicitud,
            Materiales: [],
            AreaPlanificacion: [],
            Clasificaciones: [],
            EquivalenciaMaterial: [],
            Anexos: []
        };

        const materiales = await materialSolicitudService.listarPorSolicitudParaSAP(postgresConn, id_solicitud);
        const list_area_planificacion = await areaPlanificacionMaterialService.listarParaEnviarSAP(postgresConn, id_solicitud);
        const clasificaciones = await clasificacionMaterialService.listarPorSolicitud(postgresConn, id_solicitud);
        const list_equivalencia_material = await equivalenciaMaterialService.listarParaEnviarSAP(postgresConn, id_solicitud);
        const list_anexos = await anexoMaterialService.listarParaEnviarSAP(postgresConn, id_solicitud);
        const list_regla_vista = await vistaPortalService.listarParaEnviarSAP(postgresConn, id_solicitud);

        solicitud.Materiales = materiales;
        solicitud.AreaPlanificacion = list_area_planificacion;
        solicitud.Clasificaciones = clasificaciones;
        solicitud.EquivalenciaMaterial = list_equivalencia_material;
        solicitud.Anexos = list_anexos;

        const result = await cpsaaApiProvider.registrarMaterial(solicitud, list_regla_vista);

        return result;
    } catch (error) {
        winston.info("Error en materialSolicitudController.enviarSAP. Details: ", error);
        throw error;
    }
};

async function validarMateriales(id_solicitud, materiales, tipo_carga, esAmpliacion) {
    let result = [];
    let tipoOperacion = null;

    let list_campos_decimales = null;
    let list_ramo = null;
    let list_unidad_medida = null;
    let list_partida_arancelaria = null;
    let list_centro = null;
    let list_centro_beneficio = null;
    let list_almacen = null;
    let list_organizacion_ventas = null;
    let list_canal_distribucion = null;
    let list_clasificacion = null;
    let list_area_planificacion = null;
    let list_tipo_material = null;
    let list_grupo_articulo = null;
    let list_grupo_tipo_posicion = null;
    let list_grupo_estadistica_mat = null;
    let list_grupo_imputacion_material = null;
    let list_jerarquia_producto = null;
    let list_grupo_material1 = null;
    let list_grupo_material2 = null;
    let list_verificacion_disponibilidad = null;
    let list_grupo_transporte = null;
    let list_grupo_carga = null;
    let list_grupo_compra = null;
    let list_categoria_valoracion = null;
    let list_control_precio = null;
    let list_determinacion_precio = null;
    let list_grupo_planif_necesidades = null;
    let list_tipo_mrp_caract_plani = null;
    let list_planif_necesidades = null;
    let list_calculo_tamano_lote = null;
    let list_clase_aprovis = null;
    let list_aprovis_especial = null;
    let list_toma_retrograda = null;
    let list_clave_horizonte = null;
    let list_indicador_periodo = null;
    let list_grupo_estrategia = null;
    let list_planf_neces_mixtas = null;
    let list_individual_colectivo = null;
    let list_responsable_control_produccion = null;
    let list_perfil_control_fabricacion = null;
    let list_modelo_pronostico = null;
    let list_clase_inspeccion = null;
    let list_idioma = null;
    let list_ump_var = null;
    let list_inicializacion = null;
    let list_grado_optimizacion = null;
    let list_proc_sel_modelo = null;

    //#region Consulta masiva de denominación en SAP
    let denominacionesEnSAP = [];
    if (!esAmpliacion) {
        let denominaciones = [];
        await asyncForEach(materiales, async (material) => {
            const denominacion = obtenerCampo(enums.codigo_interno.denominacion, material.campos);
            if (denominacion && (denominacion.valor && denominacion.valor !== '')) {
                if (!existeEnLista(denominaciones, denominacion.valor)) {
                    denominaciones.push(denominacion.valor);
                }
            }
        });

        if (denominaciones) {
            denominacionesEnSAP = await cpsaaApiProvider.consultarNombreMaterial(denominaciones);
        }
    }
    //#endregion

    //#region Consulta masiva de material_codigo_modelo en SAP
    let modelosEnSAP = { lista: [] };
    if (!esAmpliacion) {
        let material_codigo_modelos = [];
        await asyncForEach(materiales, async (material) => {
            const material_codigo_modelo = obtenerCampo(enums.codigo_interno.material_codigo_modelo, material.campos);
            if (material_codigo_modelo && (material_codigo_modelo.valor && material_codigo_modelo.valor !== '')) {
                if (!existeEnLista(material_codigo_modelos, material_codigo_modelo.valor)) {
                    material_codigo_modelos.push(material_codigo_modelo.valor);
                }
            }
        });

        if (material_codigo_modelos) {
            modelosEnSAP = await cpsaaApiProvider.consultarCodigoMateriales(material_codigo_modelos);
        }
    }
    //#endregion

    const reglas = await campoService.listarParaValidar(postgresConn, id_solicitud);
    const solicitud = await solicitudService.obtener(postgresConn, id_solicitud);

    await asyncForEach(materiales, async (material) => {
        let materialResult = { id_material_solicitud: material.id_material_solicitud, campos: [] };
        let obj_material = null;

        if (material.id_material_solicitud) {
            tipoOperacion = enums.tipoOperacion.actualizar;
            obj_material = await materialSolicitudService.obtenerParaValidar(postgresConn, material.id_material_solicitud);
        } else {
            tipoOperacion = enums.tipoOperacion.insertar;
        }

        // Campos por defecto - sólo al insertar
        if (!material.id_material_solicitud) {
            const campos_default = await agregarCamposPorDefault(material.campos, reglas);
            material.campos = campos_default;

            // [13] tipo_material - [6] Adm. de Materiales
            if (solicitud.tipo_material) {
                materialResult.campos = removerCampo(enums.codigo_interno.tipo_material, materialResult.campos);
                materialResult.campos.push({ codigo_interno: enums.codigo_interno.tipo_material, valor: solicitud.tipo_material, id: solicitud.id_tipo_material, error: false });
            }
        }

        console.log('\n******************************');
        console.log('Campos a procesar');
        console.log('******************************');
        console.log(material.campos);
        console.log('******************************');

        console.log('\n******************************');
        console.log('Validaciones arsa');
        console.log('******************************');

        // material_codigo_modelo
        if (existeCampo(enums.codigo_interno.material_codigo_modelo, material.campos)) {
            let list_material_codigo_modelo = [];
            if (modelosEnSAP) {
                list_material_codigo_modelo = modelosEnSAP.lista;
            }

            materialResult = await materialValidator.validar_material_codigo_modelo(enums.codigo_interno.material_codigo_modelo, material, materialResult, 20, 20, list_material_codigo_modelo, tipo_carga);
        }

        // [1] ramo
        if (existeRegla(enums.codigo_interno.ramo, reglas) && existeCampo(enums.codigo_interno.ramo, material.campos)) {
            if (!list_ramo) {
                list_ramo = await ramoService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.ramo, material, materialResult, 1, 20, list_ramo);
        }

        // [2] denominacion - [1] Solicitante
        if (existeRegla(enums.codigo_interno.denominacion, reglas) && existeCampo(enums.codigo_interno.denominacion, material.campos)) {
            // const groupResult = await materialValidator.validar_denominacion(material, materialResult, tipoCarga, tipoOperacion, id_solicitud, obj_material, materiales, denominacionesEnSAP);
            // materialResult = groupResult.result;

            // groupResult.actualizaciones.forEach(element => {
            //     actualizaciones.push(element);
            // });

            materialResult = await materialValidator.validar_denominacion(material, materialResult, 40, 40, denominacionesEnSAP, obj_material, tipo_carga);
        }

        // [3] unidad_medida_base - [1] Solicitante
        if (existeRegla(enums.codigo_interno.unidad_medida_base, reglas) && existeCampo(enums.codigo_interno.unidad_medida_base, material.campos)) {
            if (!list_unidad_medida) {
                list_unidad_medida = await unidadMedidaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_unidad_medida(enums.codigo_interno.unidad_medida_base, material, materialResult, 3, 20, list_unidad_medida);
        }

        // [4] peso_bruto - [1] Solicitante
        if (existeRegla(enums.codigo_interno.peso_bruto, reglas) && existeCampo(enums.codigo_interno.peso_bruto, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.peso_bruto, material, materialResult, 20, list_campos_decimales);
        }

        // [5] unidad_medida_peso - [1] Solicitante
        if (existeRegla(enums.codigo_interno.unidad_medida_peso, reglas) && existeCampo(enums.codigo_interno.unidad_medida_peso, material.campos)) {
            if (!list_unidad_medida) {
                list_unidad_medida = await unidadMedidaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_unidad_medida(enums.codigo_interno.unidad_medida_peso, material, materialResult, 3, 20, list_unidad_medida);
        }

        // [6] partida_arancelaria
        if (existeRegla(enums.codigo_interno.partida_arancelaria, reglas) && existeCampo(enums.codigo_interno.partida_arancelaria, material.campos)) {
            if (!list_partida_arancelaria) {
                list_partida_arancelaria = await partidaArancelariaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.partida_arancelaria, material, materialResult, 17, 20, list_partida_arancelaria);
        }

        // [7] centro_codigo_sap - [1] Solicitante
        if (existeRegla(enums.codigo_interno.centro_codigo_sap, reglas) && existeCampo(enums.codigo_interno.centro_codigo_sap, material.campos)) {
            if (!list_centro) {
                list_centro = await centroService.listarParaValidar(postgresConn, id_solicitud);
            }

            materialResult = await materialValidator.validar_centro(material, materialResult, 4, 20, list_centro, obj_material);
        }

        // [8] centro_beneficio_codigo_sap
        if (existeRegla(enums.codigo_interno.centro_beneficio_codigo_sap, reglas) && existeCampo(enums.codigo_interno.centro_beneficio_codigo_sap, material.campos)) {
            if (!list_centro_beneficio) {
                list_centro_beneficio = await centroBeneficioService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.centro_beneficio_codigo_sap, material, materialResult, 10, 20, list_centro_beneficio);
        }

        // [9] almacen_codigo_sap
        if (existeRegla(enums.codigo_interno.almacen_codigo_sap, reglas) && existeCampo(enums.codigo_interno.almacen_codigo_sap, material.campos)) {
            if (!list_almacen) {
                list_almacen = await almacenService.listarParaValidar(postgresConn);
            }
            const centro_codigo_sap = await obtener_centro_codigo_sap(materialResult.campos, obj_material);

            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.almacen_codigo_sap, material, materialResult, 4, 20, list_almacen, centro_codigo_sap);

            if (existeRegla(enums.codigo_interno.alm_aprov_ext, reglas)) {
                var almacen_codigo_sap = obtenerCampo(enums.codigo_interno.almacen_codigo_sap, materialResult.campos);
                if (!almacen_codigo_sap.error && tipoOperacion === enums.tipoOperacion.insertar) {
                    materialResult.campos = removerCampo(enums.codigo_interno.alm_aprov_ext, materialResult.campos);
                    materialResult.campos.push({ codigo_interno: enums.codigo_interno.alm_aprov_ext, valor: almacen_codigo_sap.valor, error: false });
                }
            }
        }

        // [10] organizacion_ventas
        if (existeRegla(enums.codigo_interno.organizacion_ventas, reglas) && existeCampo(enums.codigo_interno.organizacion_ventas, material.campos)) {
            if (!list_organizacion_ventas) {
                list_organizacion_ventas = await organizacionVentaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.organizacion_ventas, material, materialResult, 4, 20, list_organizacion_ventas);
        }

        // [11] canal_distribucion
        if (existeRegla(enums.codigo_interno.canal_distribucion, reglas) && existeCampo(enums.codigo_interno.canal_distribucion, material.campos)) {
            if (!list_canal_distribucion) {
                list_canal_distribucion = await canalDistribucionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.canal_distribucion, material, materialResult, 2, 20, list_canal_distribucion);
        }

        // [12] clasificacion_tab
        if (existeRegla(enums.codigo_interno.clasificacion_tab, reglas) && existeCampo(enums.codigo_interno.clasificacion_tab, material.campos)) {
            if (!list_clasificacion) {
                list_clasificacion = await clasificacionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_clasificacion(enums.codigo_interno.clasificacion_tab, material, materialResult, 18, 20, list_clasificacion);
        }

        // [13] tipo_material
        if (existeRegla(enums.codigo_interno.tipo_material, reglas) && existeCampo(enums.codigo_interno.tipo_material, material.campos)) {
            if (!list_tipo_material) {
                list_tipo_material = await tipoMaterialService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.tipo_material, material, materialResult, 4, 20, list_tipo_material);
        }

        // [14] grupo_articulo - [6] Adm. de Materiales
        if (existeRegla(enums.codigo_interno.grupo_articulo, reglas) && existeCampo(enums.codigo_interno.grupo_articulo, material.campos)) {
            if (!list_grupo_articulo) {
                list_grupo_articulo = await grupoArticuloService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_articulo, material, materialResult, 9, 20, list_grupo_articulo);
        }

        // [15] sector
        if (existeRegla(enums.codigo_interno.sector, reglas) && existeCampo(enums.codigo_interno.sector, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.sector, material, materialResult, 2, 20);
        }

        // [16] grupo_tipo_posicion_gral
        if (existeRegla(enums.codigo_interno.grupo_tipo_posicion_gral, reglas) && existeCampo(enums.codigo_interno.grupo_tipo_posicion_gral, material.campos)) {
            if (!list_grupo_tipo_posicion) {
                list_grupo_tipo_posicion = await grupoTipoPosicionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_tipo_posicion_gral, material, materialResult, 4, 20, list_grupo_tipo_posicion);
        }

        // [17] codigo_ean
        if (existeRegla(enums.codigo_interno.codigo_ean, reglas) && existeCampo(enums.codigo_interno.codigo_ean, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.codigo_ean, material, materialResult, 18, 20);
        }

        // [18] tipo_ean
        if (existeRegla(enums.codigo_interno.tipo_ean, reglas) && existeCampo(enums.codigo_interno.tipo_ean, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.tipo_ean, material, materialResult, 2, 20);
        }

        // [19] texto_compra - [6] Adm. de Materiales
        if (existeRegla(enums.codigo_interno.texto_compra, reglas) && existeCampo(enums.codigo_interno.texto_compra, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.texto_compra, material, materialResult, 250, 250);

            if (existeRegla(enums.codigo_interno.texto_comercial, reglas)) {
                var texto_compra = obtenerCampo(enums.codigo_interno.texto_compra, material.campos);
                if (!texto_compra.error && tipoOperacion === enums.tipoOperacion.insertar) {
                    materialResult.campos = removerCampo(enums.codigo_interno.texto_comercial, materialResult.campos);
                    materialResult.campos.push({ codigo_interno: enums.codigo_interno.texto_comercial, valor: texto_compra.valor, error: false });
                }
            }
        }

        // [20] link_adjunt

        // [21] clasificacion_fiscal
        if (existeRegla(enums.codigo_interno.clasificacion_fiscal, reglas) && existeCampo(enums.codigo_interno.clasificacion_fiscal, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.clasificacion_fiscal, material, materialResult, 1, 20);
        }

        // [22] unidad_medida_venta - [5] Comercial
        if (existeRegla(enums.codigo_interno.unidad_medida_venta, reglas) && existeCampo(enums.codigo_interno.unidad_medida_venta, material.campos)) {
            if (!list_unidad_medida) {
                list_unidad_medida = await unidadMedidaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_unidad_medida(enums.codigo_interno.unidad_medida_venta, material, materialResult, 3, 20, list_unidad_medida);
        }

        // [23] grupo_estadistica_mat - [5] Comercial
        if (existeRegla(enums.codigo_interno.grupo_estadistica_mat, reglas) && existeCampo(enums.codigo_interno.grupo_estadistica_mat, material.campos)) {
            if (!list_grupo_estadistica_mat) {
                list_grupo_estadistica_mat = await grupoEstadisticaMatService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_estadistica_mat, material, materialResult, 2, 20, list_grupo_estadistica_mat);
        }

        // [24] grupo_tipo_posicion
        if (existeRegla(enums.codigo_interno.grupo_tipo_posicion, reglas) && existeCampo(enums.codigo_interno.grupo_tipo_posicion, material.campos)) {
            if (!list_grupo_tipo_posicion) {
                list_grupo_tipo_posicion = await grupoTipoPosicionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_tipo_posicion, material, materialResult, 4, 20, list_grupo_tipo_posicion);
        }

        // [25] grupo_imputacion_material - [5] Comercial
        if (existeRegla(enums.codigo_interno.grupo_imputacion_material, reglas) && existeCampo(enums.codigo_interno.grupo_imputacion_material, material.campos)) {
            if (!list_grupo_imputacion_material) {
                list_grupo_imputacion_material = await grupoImputacionMaterialService.listarParaValidar(postgresConn);
            }

            materialResult = await validar_codigo_sap(enums.codigo_interno.grupo_imputacion_material, material, materialResult, 2, 20, list_grupo_imputacion_material);
        }

        // [26] jerarquia_producto - [5] Comercial
        if (existeRegla(enums.codigo_interno.jerarquia_producto, reglas) && existeCampo(enums.codigo_interno.jerarquia_producto, material.campos)) {
            if (!list_jerarquia_producto) {
                list_jerarquia_producto = await jerarquiaProductoService.listarParaValidar(postgresConn);
            }

            materialResult = await validar_codigo_sap(enums.codigo_interno.jerarquia_producto, material, materialResult, 18, 20, list_jerarquia_producto);
        }

        // [27] grupos_material1 - [5] Comercial
        if (existeRegla(enums.codigo_interno.grupo_material1, reglas) && existeCampo(enums.codigo_interno.grupo_material1, material.campos)) {
            if (!list_grupo_material1) {
                list_grupo_material1 = await grupoMaterial1Service.listarParaValidar(postgresConn);
            }

            materialResult = await validar_codigo_sap(enums.codigo_interno.grupo_material1, material, materialResult, 3, 20, list_grupo_material1);
        }

        // [28] grupos_material2 - [5] Comercial
        if (existeRegla(enums.codigo_interno.grupo_material2, reglas) && existeCampo(enums.codigo_interno.grupo_material2, material.campos)) {
            if (!list_grupo_material2) {
                list_grupo_material2 = await grupoMaterial2Service.listarParaValidar(postgresConn);
            }

            materialResult = await validar_codigo_sap(enums.codigo_interno.grupo_material2, material, materialResult, 3, 20, list_grupo_material2);
        }

        // [29] texto_comercial - [5] Comercial
        if (existeRegla(enums.codigo_interno.texto_comercial, reglas) && existeCampo(enums.codigo_interno.texto_comercial, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.texto_comercial, material, materialResult, 250, 250);
        }

        // [30] verificacion_disponibilidad
        if (existeRegla(enums.codigo_interno.verificacion_disponibilidad, reglas) && existeCampo(enums.codigo_interno.verificacion_disponibilidad, material.campos)) {
            if (!list_verificacion_disponibilidad) {
                list_verificacion_disponibilidad = await verificacionDisponibilidadService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.verificacion_disponibilidad, material, materialResult, 2, 20, list_verificacion_disponibilidad);
        }

        // [31] grupo_transporte - [6] Adm. de Materiales
        if (existeRegla(enums.codigo_interno.grupo_transporte, reglas) && existeCampo(enums.codigo_interno.grupo_transporte, material.campos)) {
            if (!list_grupo_transporte) {
                list_grupo_transporte = await grupoTransporteService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_transporte, material, materialResult, 4, 20, list_grupo_transporte);
        }

        // [32] grupo_carga - [6] Adm. de Materiales
        if (existeRegla(enums.codigo_interno.grupo_carga, reglas) && existeCampo(enums.codigo_interno.grupo_carga, material.campos)) {
            if (!list_grupo_carga) {
                list_grupo_carga = await grupoCargaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_carga, material, materialResult, 4, 20, list_grupo_carga);
        }

        // [33] stock_negativo
        if (existeRegla(enums.codigo_interno.stock_negativo, reglas) && existeCampo(enums.codigo_interno.stock_negativo, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.stock_negativo, material, materialResult, 4, 20);
        }

        // [34] formula_concreto
        if (existeRegla(enums.codigo_interno.formula_concreto, reglas) && existeCampo(enums.codigo_interno.formula_concreto, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.formula_concreto, material, materialResult, 30, 30);
        }

        // [35] grupo_compra
        if (existeRegla(enums.codigo_interno.grupo_compra, reglas) && existeCampo(enums.codigo_interno.grupo_compra, material.campos)) {
            if (!list_grupo_compra) {
                list_grupo_compra = await grupoCompraService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_compra, material, materialResult, 3, 20, list_grupo_compra);
        }

        // [36] unidad_medida_pedido - [6] Adm. de Materiales
        if (existeRegla(enums.codigo_interno.unidad_medida_pedido, reglas) && existeCampo(enums.codigo_interno.unidad_medida_pedido, material.campos)) {
            if (!list_unidad_medida) {
                list_unidad_medida = await unidadMedidaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_unidad_medida(enums.codigo_interno.unidad_medida_pedido, material, materialResult, 3, 20, list_unidad_medida);
        }

        // [37]	precio_estandar - [8] Control de Gestión
        if (existeRegla(enums.codigo_interno.precio_estandar, reglas) && existeCampo(enums.codigo_interno.precio_estandar, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.precio_estandar, material, materialResult, 20, list_campos_decimales);
        }

        // [38]	precio_variable
        if (existeRegla(enums.codigo_interno.precio_variable, reglas) && existeCampo(enums.codigo_interno.precio_variable, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.precio_variable, material, materialResult, 20, list_campos_decimales);
        }

        // [39] categoria_valoracion - [4] Costos
        if (existeRegla(enums.codigo_interno.categoria_valoracion, reglas) && existeCampo(enums.codigo_interno.categoria_valoracion, material.campos)) {
            if (!list_categoria_valoracion) {
                list_categoria_valoracion = await categoriaValoracionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.categoria_valoracion, material, materialResult, 4, 20, list_categoria_valoracion);
        }

        // [40] control_precio
        if (existeRegla(enums.codigo_interno.control_precio, reglas) && existeCampo(enums.codigo_interno.control_precio, material.campos)) {
            if (!list_control_precio) {
                list_control_precio = await controlPrecioService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.control_precio, material, materialResult, 1, 20, list_control_precio);
        }

        // [41] determinacion_precio
        if (existeRegla(enums.codigo_interno.determinacion_precio, reglas) && existeCampo(enums.codigo_interno.determinacion_precio, material.campos)) {
            if (!list_determinacion_precio) {
                list_determinacion_precio = await determinacionPrecioService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.determinacion_precio, material, materialResult, 1, 20, list_determinacion_precio);
        }

        // [42] unidad_medida_almacen
        if (existeRegla(enums.codigo_interno.unidad_medida_almacen, reglas) && existeCampo(enums.codigo_interno.unidad_medida_almacen, material.campos)) {
            if (!list_unidad_medida) {
                list_unidad_medida = await unidadMedidaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_unidad_medida(enums.codigo_interno.unidad_medida_almacen, material, materialResult, 3, 20, list_unidad_medida);
        }

        // [43] ubicacion
        if (existeRegla(enums.codigo_interno.ubicacion, reglas) && existeCampo(enums.codigo_interno.ubicacion, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.ubicacion, material, materialResult, 10, 20);
        }

        // [44]	dcto_pronto_pago - [5] Comercial
        if (existeRegla(enums.codigo_interno.dcto_pronto_pago, reglas) && existeCampo(enums.codigo_interno.dcto_pronto_pago, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.dcto_pronto_pago, material, materialResult, 20, list_campos_decimales);
        }

        // [45] grupo_planif_necesidades
        if (existeRegla(enums.codigo_interno.grupo_planif_necesidades, reglas) && existeCampo(enums.codigo_interno.grupo_planif_necesidades, material.campos)) {
            if (!list_grupo_planif_necesidades) {
                list_grupo_planif_necesidades = await grupoPlanifNecesidadesService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);

            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.grupo_planif_necesidades, material, materialResult, 4, 20, list_grupo_planif_necesidades, centro_codigo_sap);
        }

        // [46] tipo_mrp_caract_plani
        if (existeRegla(enums.codigo_interno.tipo_mrp_caract_plani, reglas) && existeCampo(enums.codigo_interno.tipo_mrp_caract_plani, material.campos)) {
            if (!list_tipo_mrp_caract_plani) {
                list_tipo_mrp_caract_plani = await tipoMrpCaractPlaniService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.tipo_mrp_caract_plani, material, materialResult, 2, 20, list_tipo_mrp_caract_plani);
        }

        // [47] planif_necesidades
        if (existeRegla(enums.codigo_interno.planif_necesidades, reglas) && existeCampo(enums.codigo_interno.planif_necesidades, material.campos)) {
            if (!list_planif_necesidades) {
                list_planif_necesidades = await planifNecesidadesService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);

            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.planif_necesidades, material, materialResult, 3, 20, list_planif_necesidades, centro_codigo_sap);
        }

        // [48] calculo_tamano_lote
        if (existeRegla(enums.codigo_interno.calculo_tamano_lote, reglas) && existeCampo(enums.codigo_interno.calculo_tamano_lote, material.campos)) {
            if (!list_calculo_tamano_lote) {
                list_calculo_tamano_lote = await calculoTamanoLoteService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.calculo_tamano_lote, material, materialResult, 2, 20, list_calculo_tamano_lote);
        }

        // [49] area_planificacion_tab
        if (existeRegla(enums.codigo_interno.area_planificacion_tab, reglas) && existeCampo(enums.codigo_interno.area_planificacion_tab, material.campos)) {
            if (!list_area_planificacion) {
                list_area_planificacion = await areaPlanificacionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_area_planificacion(enums.codigo_interno.area_planificacion_tab, material, materialResult, 10, 20, list_area_planificacion);
        }

        // [50] grupo_planif_necesidades_tab
        // [51] caracteristica_necesidad_tab
        // [52] punto_pedido_tab
        // [53] stock_alm_max_tab
        // [54] planif_necesidades_tab
        // [55] calculo_tamano_lote_tab
        // [56] valor_redondeo_tab
        // [57] alm_aprov_ext_tab
        // [58] plazo_entrega_prev_tab
        // [59] nivel_servicio_tab
        // [60] stock_seguridad_tab
        // [61] indicador_margen_seg_tab
        // [62] margen_seguridad_tab
        // [63] modelo_pronostico_tab
        // [64] periodo_pasado_tab
        // [65] periodo_pronostico_tab
        // [66] periodo_estaci_tab
        // [67] limite_alarma_tab

        // [68] clase_aprovis
        if (existeRegla(enums.codigo_interno.clase_aprovis, reglas) && existeCampo(enums.codigo_interno.clase_aprovis, material.campos)) {
            if (!list_clase_aprovis) {
                list_clase_aprovis = await claseAprovisService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.clase_aprovis, material, materialResult, 1, 20, list_clase_aprovis);
        }

        // [69] aprovis_especial
        if (existeRegla(enums.codigo_interno.aprovis_especial, reglas) && existeCampo(enums.codigo_interno.aprovis_especial, material.campos)) {
            if (!list_aprovis_especial) {
                list_aprovis_especial = await aprovisEspecialService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);

            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.aprovis_especial, material, materialResult, 20, 20, list_aprovis_especial, centro_codigo_sap);
        }

        // [70] toma_retrograda
        if (existeRegla(enums.codigo_interno.toma_retrograda, reglas) && existeCampo(enums.codigo_interno.toma_retrograda, material.campos)) {
            if (!list_toma_retrograda) {
                list_toma_retrograda = await tomaRetrogradaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.toma_retrograda, material, materialResult, 1, 20, list_toma_retrograda);
        }

        // [71] almacen_produccion - [71] Calidad
        if (existeRegla(enums.codigo_interno.almacen_produccion, reglas) && existeCampo(enums.codigo_interno.almacen_produccion, material.campos)) {
            if (!list_almacen) {
                list_almacen = await almacenService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);

            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.almacen_produccion, material, materialResult, 4, 20, list_almacen, centro_codigo_sap);
        }

        // [72] alm_aprov_ext

        // [73] co_producto
        if (existeRegla(enums.codigo_interno.co_producto, reglas) && existeCampo(enums.codigo_interno.co_producto, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.co_producto, material, materialResult, 1, 20);
        }

        // [74]	tiempo_fab_propia_pn2
        if (existeRegla(enums.codigo_interno.tiempo_fab_propia_pn2, reglas) && existeCampo(enums.codigo_interno.tiempo_fab_propia_pn2, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.tiempo_fab_propia_pn2, material, materialResult, 20, list_campos_decimales);
        }

        // [75]	plaza_entrega_prev
        if (existeRegla(enums.codigo_interno.plaza_entrega_prev, reglas) && existeCampo(enums.codigo_interno.plaza_entrega_prev, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.plaza_entrega_prev, material, materialResult, 20, list_campos_decimales);
        }

        // [76] clave_horizonte
        if (existeRegla(enums.codigo_interno.clave_horizonte, reglas) && existeCampo(enums.codigo_interno.clave_horizonte, material.campos)) {
            if (!list_clave_horizonte) {
                list_clave_horizonte = await claveHorizonteService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);

            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.clave_horizonte, material, materialResult, 3, 20, list_clave_horizonte, centro_codigo_sap);
        }

        // [77]	stock_seguridad_pn2
        if (existeRegla(enums.codigo_interno.stock_seguridad_pn2, reglas) && existeCampo(enums.codigo_interno.stock_seguridad_pn2, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.stock_seguridad_pn2, material, materialResult, 20, list_campos_decimales);
        }

        // [78]	stock_seguridad_min_pn2
        if (existeRegla(enums.codigo_interno.stock_seguridad_min_pn2, reglas) && existeCampo(enums.codigo_interno.stock_seguridad_min_pn2, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.stock_seguridad_min_pn2, material, materialResult, 20, list_campos_decimales);
        }

        // [79]	nivel_servicio_pn2
        if (existeRegla(enums.codigo_interno.nivel_servicio_pn2, reglas) && existeCampo(enums.codigo_interno.nivel_servicio_pn2, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.nivel_servicio_pn2, material, materialResult, 20, list_campos_decimales);
        }

        // [80]	indicador_periodo
        if (existeRegla(enums.codigo_interno.indicador_periodo, reglas) && existeCampo(enums.codigo_interno.indicador_periodo, material.campos)) {
            if (!list_indicador_periodo) {
                list_indicador_periodo = await indicadorPeriodoService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.indicador_periodo, material, materialResult, 1, 20, list_indicador_periodo);
        }

        // [81]	grupo_estrategia
        if (existeRegla(enums.codigo_interno.grupo_estrategia, reglas) && existeCampo(enums.codigo_interno.grupo_estrategia, material.campos)) {
            if (!list_grupo_estrategia) {
                list_grupo_estrategia = await grupoEstrategiaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grupo_estrategia, material, materialResult, 2, 20, list_grupo_estrategia);
        }

        // [82]	planf_neces_mixtas
        if (existeRegla(enums.codigo_interno.planf_neces_mixtas, reglas) && existeCampo(enums.codigo_interno.planf_neces_mixtas, material.campos)) {
            if (!list_planf_neces_mixtas) {
                list_planf_neces_mixtas = await planfNecesMixtasService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.planf_neces_mixtas, material, materialResult, 1, 20, list_planf_neces_mixtas);
        }

        // [83]	indicador_periodo
        if (existeRegla(enums.codigo_interno.indicador_periodo, reglas) && existeCampo(enums.codigo_interno.individual_colectivo, material.campos)) {
            if (!list_individual_colectivo) {
                list_individual_colectivo = await individualColectivoService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.individual_colectivo, material, materialResult, 1, 20, list_individual_colectivo);
        }

        // [84]	rechazo_componente
        if (existeRegla(enums.codigo_interno.rechazo_componente, reglas) && existeCampo(enums.codigo_interno.rechazo_componente, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.rechazo_componente, material, materialResult, 20, list_campos_decimales);
        }

        // [85] sujeto_lote
        if (existeRegla(enums.codigo_interno.sujeto_lote, reglas) && existeCampo(enums.codigo_interno.sujeto_lote, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.sujeto_lote, material, materialResult, 1, 20);
        }

        // [86] responsable_control_produccion - [3] Calidad
        if (existeRegla(enums.codigo_interno.responsable_control_produccion, reglas) && existeCampo(enums.codigo_interno.responsable_control_produccion, material.campos)) {
            if (!list_responsable_control_produccion) {
                list_responsable_control_produccion = await responsableControlProduccionService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);
            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.responsable_control_produccion, material, materialResult, 3, 20, list_responsable_control_produccion, centro_codigo_sap);
        }

        // [87] perfil_control_fabricacion - [3] Calidad
        if (existeRegla(enums.codigo_interno.perfil_control_fabricacion, reglas) && existeCampo(enums.codigo_interno.perfil_control_fabricacion, material.campos)) {
            if (!list_perfil_control_fabricacion) {
                list_perfil_control_fabricacion = await perfilControlFabricacionService.listarParaValidar(postgresConn);
            }

            const centro_codigo_sap = obtener_centro_codigo_sap(materialResult.campos, obj_material);
            materialResult = await materialValidator.validar_codigo_sap_centro(enums.codigo_interno.perfil_control_fabricacion, material, materialResult, 6, 20, list_perfil_control_fabricacion, centro_codigo_sap);
        }

        // [88] unidad_medida_fabricacion
        if (existeRegla(enums.codigo_interno.unidad_medida_fabricacion, reglas) && existeCampo(enums.codigo_interno.unidad_medida_fabricacion, material.campos)) {
            if (!list_unidad_medida) {
                list_unidad_medida = await unidadMedidaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_unidad_medida(enums.codigo_interno.unidad_medida_fabricacion, material, materialResult, 3, 20, list_unidad_medida);
        }

        // [89]	limite_exceso_sum_ilimitado
        if (existeRegla(enums.codigo_interno.limite_exceso_sum_ilimitado, reglas) && existeCampo(enums.codigo_interno.limite_exceso_sum_ilimitado, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.limite_exceso_sum_ilimitado, material, materialResult, 20, list_campos_decimales);
        }

        // [90] no existe campo

        // [91] modelo_pronostico
        if (existeRegla(enums.codigo_interno.modelo_pronostico, reglas) && existeCampo(enums.codigo_interno.modelo_pronostico, material.campos)) {
            if (!list_modelo_pronostico) {
                list_modelo_pronostico = await modeloPronosticoService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.modelo_pronostico, material, materialResult, 1, 20, list_modelo_pronostico);
        }

        // [92]	periodo_pasado
        if (existeRegla(enums.codigo_interno.periodo_pasado, reglas) && existeCampo(enums.codigo_interno.periodo_pasado, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.periodo_pasado, material, materialResult, 20, list_campos_decimales);
        }

        // [93]	periodo_pronostico
        if (existeRegla(enums.codigo_interno.periodo_pronostico, reglas) && existeCampo(enums.codigo_interno.periodo_pronostico, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }
            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.periodo_pronostico, material, materialResult, 20, list_campos_decimales);
        }

        // [94] inicializacion
        if (existeRegla(enums.codigo_interno.inicializacion, reglas) && existeCampo(enums.codigo_interno.inicializacion, material.campos)) {
            if (!list_inicializacion) {
                list_inicializacion = await inicializacionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.inicializacion, material, materialResult, 1, 20, list_inicializacion);
        }

        // [95]	limite_alarma
        if (existeRegla(enums.codigo_interno.limite_alarma, reglas) && existeCampo(enums.codigo_interno.limite_alarma, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.limite_alarma, material, materialResult, 20, list_campos_decimales);
        }

        // [96]	grado_optimizacion
        if (existeRegla(enums.codigo_interno.grado_optimizacion, reglas) && existeCampo(enums.codigo_interno.grado_optimizacion, material.campos)) {
            if (!list_grado_optimizacion) {
                list_grado_optimizacion = await gradoOptimizacionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.grado_optimizacion, material, materialResult, 1, 20, list_grado_optimizacion);
        }

        // [97]	proc_sel_modelo
        if (existeRegla(enums.codigo_interno.proc_sel_modelo, reglas) && existeCampo(enums.codigo_interno.proc_sel_modelo, material.campos)) {
            if (!list_proc_sel_modelo) {
                list_proc_sel_modelo = await procSelModeloService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.proc_sel_modelo, material, materialResult, 1, 20, list_proc_sel_modelo);
        }

        // [98]	anular_autormaticamente
        // [99]	optimizacion_parametros

        // [100] estructura_cuantica
        if (existeRegla(enums.codigo_interno.estructura_cuantica, reglas) && existeCampo(enums.codigo_interno.estructura_cuantica, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.estructura_cuantica, material, materialResult, 1, 20);
        }
        // [101] origen_material
        if (existeRegla(enums.codigo_interno.origen_material, reglas) && existeCampo(enums.codigo_interno.origen_material, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.origen_material, material, materialResult, 1, 20);
        }
        // [102] tamano_lote
        if (existeRegla(enums.codigo_interno.tamano_lote, reglas) && existeCampo(enums.codigo_interno.tamano_lote, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }
            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.tamano_lote, material, materialResult, 20, list_campos_decimales);
        }

        // [103] no existe campo
        // [104] no existe campo
        // [105] no existe campo
        // [106] no existe campo

        // [107] clase_inspeccion_tab
        if (existeRegla(enums.codigo_interno.clase_inspeccion_tab, reglas) && existeCampo(enums.codigo_interno.clase_inspeccion_tab, material.campos)) {
            if (!list_clase_inspeccion) {
                list_clase_inspeccion = await claseInspeccionService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_clase_inspeccion_tab(enums.codigo_interno.clase_inspeccion_tab, material, materialResult, 4, 20, list_clase_inspeccion);
        }

        // [108] criticos
        if (existeRegla(enums.codigo_interno.criticos, reglas) && existeCampo(enums.codigo_interno.criticos, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.criticos, material, materialResult, 1, 20);
        }

        // [109] estrategicos
        if (existeRegla(enums.codigo_interno.estrategicos, reglas) && existeCampo(enums.codigo_interno.estrategicos, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.estrategicos, material, materialResult, 1, 20);
        }

        // [110] ump_var - [6] Adm. de Materiales
        if (existeRegla(enums.codigo_interno.ump_var, reglas) && existeCampo(enums.codigo_interno.ump_var, material.campos)) {
            if (!list_ump_var) {
                list_ump_var = [{ codigo_sap: '', nombre: 'No Activo' }, { codigo_sap: '1', nombre: 'Activo' }, { codigo_sap: '2', nombre: 'Activo con Precio propio' }];
            }
            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.ump_var, material, materialResult, 1, 20, list_ump_var);
        }

        // [111] cantidad_base
        if (existeRegla(enums.codigo_interno.cantidad_base, reglas) && existeCampo(enums.codigo_interno.cantidad_base, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.cantidad_base, material, materialResult, 20, list_campos_decimales);
        }

        // [112] idioma
        if (existeRegla(enums.codigo_interno.idioma, reglas) && existeCampo(enums.codigo_interno.idioma, material.campos)) {
            if (!list_idioma) {
                list_idioma = await idiomaService.listarParaValidar(postgresConn);
            }

            materialResult = await materialValidator.validar_codigo_sap(enums.codigo_interno.idioma, material, materialResult, 2, 20, list_idioma);
        }

        // [113] ampliacion
        if (esAmpliacion) {
            materialResult.campos.push({ codigo_interno: enums.codigo_interno.ampliacion, valor: 'X', error: false });
        }

        // [114] precio_base
        if (existeRegla(enums.codigo_interno.precio_base, reglas) && existeCampo(enums.codigo_interno.precio_base, material.campos)) {
            if (!list_campos_decimales) {
                list_campos_decimales = await campoService.listarCamposDecimales(postgresConn);
            }

            materialResult = await materialValidator.validar_decimal(enums.codigo_interno.precio_base, material, materialResult, 20, list_campos_decimales);
        }

        // [115] moneda
        if (existeRegla(enums.codigo_interno.moneda, reglas) && existeCampo(enums.codigo_interno.moneda, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.moneda, material, materialResult, 3, 20);
        }

        // [116] ind_ped_automa
        if (existeRegla(enums.codigo_interno.ind_ped_automa, reglas) && existeCampo(enums.codigo_interno.ind_ped_automa, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.ind_ped_automa, material, materialResult, 1, 20);
        }

        // [117] exceso_sum_ilimitado
        if (existeRegla(enums.codigo_interno.exceso_sum_ilimitado, reglas) && existeCampo(enums.codigo_interno.exceso_sum_ilimitado, material.campos)) {
            materialResult = await materialValidator.validar_texto(enums.codigo_interno.exceso_sum_ilimitado, material, materialResult, 1, 20);
        }

        console.log('******************************');

        result.push(materialResult);
    });

    if (!esAmpliacion) {
        result = await materialValidator.validar_ampliacion(id_solicitud, result, tipo_carga);
    }

    return result;
};

async function agregarCamposPorDefault(campos, reglas) {

    await asyncForEach(reglas, async (campo) => {
        if (campo.valor_defecto && campo.valor_defecto !== constantes.emptyString) {
            const obj_default = { codigo_interno: campo.codigo_interno, porDefecto: true }

            switch (campo.codigo_interno) {
                case enums.codigo_interno.clasificacion_tab:
                case enums.codigo_interno.area_planificacion_tab:
                case enums.codigo_interno.nivel_servicio_tab:
                    obj_default.valores = [{ valor: campo.valor_defecto }];
                    break;
                default:
                    obj_default.valor = campo.valor_defecto
                    break;
            }

            campos.push(obj_default);
        }
    });

    return campos;
};

function obtenerRepresentation(codigo_interno, obj, borrador, id, descripcion, error) {
    obj[codigo_interno] = descripcion;
    obj[codigo_interno + "_valor"] = borrador;
    obj[codigo_interno + "_id"] = id;
    obj[codigo_interno + "_descripcion"] = descripcion;
    obj[codigo_interno + "_error"] = error;
    obj[codigo_interno + "_visible"] = true;

    return obj;
};

function obtenerCamposVisibles(rep, m, campos, list_clasificacion, list_clase_inspeccion, list_area_planificacion) {
    rep["material_codigo_sap"] = m.material_codigo_sap;

    if (campos.some(e => e.codigo_interno === enums.codigo_interno.ramo))
        /*[1]*/rep = obtenerRepresentation(enums.codigo_interno.ramo, rep, m.ramo_borrador, m.ramo, m.ramo_descripcion, m.ramo_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.denominacion))
        /*[2]*/ rep = obtenerRepresentation(enums.codigo_interno.denominacion, rep, m.denominacion_borrador, null, m.denominacion, m.denominacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.unidad_medida_base))
        /*[3]*/ rep = obtenerRepresentation(enums.codigo_interno.unidad_medida_base, rep, m.unidad_medida_base, m.id_unidad_medida_base, m.unidad_medida_base_descripcion, m.unidad_medida_base_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.peso_bruto))
        /*[4]*/rep = obtenerRepresentation(enums.codigo_interno.peso_bruto, rep, m.peso_bruto_borrador, null, m.peso_bruto, m.peso_bruto_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.unidad_medida_peso))
        /*[5]*/rep = obtenerRepresentation(enums.codigo_interno.unidad_medida_peso, rep, m.unidad_medida_peso, m.id_unidad_medida_peso, m.unidad_medida_peso_descripcion, m.unidad_medida_peso_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.partida_arancelaria))
        /*[6]*/rep = obtenerRepresentation(enums.codigo_interno.partida_arancelaria, rep, m.partida_arancelaria_borrador, m.partida_arancelaria, m.partida_arancelaria_descripcion, m.partida_arancelaria_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.centro_codigo_sap))
        /*[7]*/rep = obtenerRepresentation(enums.codigo_interno.centro_codigo_sap, rep, m.centro_codigo_sap_borrador, m.centro_codigo_sap, m.centro_descripcion, m.centro_codigo_sap_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.centro_beneficio_codigo_sap))
        /*[8]*/rep = obtenerRepresentation(enums.codigo_interno.centro_beneficio_codigo_sap, rep, m.centro_beneficio_codigo_sap_borrador, m.centro_beneficio_codigo_sap, m.centro_beneficio_descripcion, m.centro_beneficio_codigo_sap_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.almacen_codigo_sap))
        /*[9]*/rep = obtenerRepresentation(enums.codigo_interno.almacen_codigo_sap, rep, m.almacen_codigo_sap_borrador, m.almacen_codigo_sap, m.almacen_descripcion, m.almacen_codigo_sap_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.organizacion_ventas))
        /*[10]*/rep = obtenerRepresentation(enums.codigo_interno.organizacion_ventas, rep, m.organizacion_ventas_borrador, m.organizacion_ventas, m.organizacion_ventas_descripcion, m.organizacion_ventas_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.canal_distribucion))
        /*[11]*/rep = obtenerRepresentation(enums.codigo_interno.canal_distribucion, rep, m.canal_distribucion_borrador, m.canal_distribucion, m.canal_distribucion_descripcion, m.canal_distribucion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.tipo_material))
        /*[13]*/rep = obtenerRepresentation(enums.codigo_interno.tipo_material, rep, m.tipo_material_borrador, m.tipo_material, m.tipo_material_descripcion, m.tipo_material_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_articulo))
        /*[14]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_articulo, rep, m.grupo_articulo_borrador, m.grupo_articulo, m.grupo_articulo_descripcion, m.grupo_articulo_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.sector))
        /*[15]*/rep = obtenerRepresentation(enums.codigo_interno.sector, rep, m.sector_borrador, null, m.sector, m.sector_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_tipo_posicion_gral))
        /*[16]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_tipo_posicion_gral, rep, m.grupo_tipo_posicion_gral_borrador, m.grupo_tipo_posicion_gral, m.grupo_tipo_posicion_gral_descripcion, m.grupo_tipo_posicion_gral_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.codigo_ean))
        /*[17]*/rep = obtenerRepresentation(enums.codigo_interno.codigo_ean, rep, m.codigo_ean_borrador, null, m.codigo_ean, m.codigo_ean_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.tipo_ean))
        /*[18]*/rep = obtenerRepresentation(enums.codigo_interno.tipo_ean, rep, m.tipo_ean_borrador, null, m.tipo_ean, m.tipo_ean_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.texto_compra))
        /*[19]*/rep = obtenerRepresentation(enums.codigo_interno.texto_compra, rep, m.texto_compra_borrador, null, m.texto_compra, m.texto_compra_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.clasificacion_fiscal))
        /*[21]*/rep = obtenerRepresentation(enums.codigo_interno.clasificacion_fiscal, rep, m.clasificacion_fiscal_borrador, null, m.clasificacion_fiscal, m.clasificacion_fiscal_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.unidad_medida_venta))
        /*[22]*/rep = obtenerRepresentation(enums.codigo_interno.unidad_medida_venta, rep, m.unidad_medida_venta, m.id_unidad_medida_venta, m.unidad_medida_venta_descripcion, m.unidad_medida_venta_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_estadistica_mat))
        /*[23]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_estadistica_mat, rep, m.grupo_estadistica_mat_borrador, null, m.grupo_estadistica_mat, m.grupo_estadistica_mat_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_tipo_posicion))
        /*[24]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_tipo_posicion, rep, m.grupo_tipo_posicion_borrador, m.grupo_tipo_posicion, m.grupo_tipo_posicion_descripcion, m.grupo_tipo_posicion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_imputacion_material))
        /*[25]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_imputacion_material, rep, m.grupo_imputacion_material_borrador, m.grupo_imputacion_material, m.grupo_imputacion_material_descripcion, m.grupo_imputacion_material_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.jerarquia_producto))
        /*[26]*/rep = obtenerRepresentation(enums.codigo_interno.jerarquia_producto, rep, m.jerarquia_producto_borrador, m.jerarquia_producto, m.jerarquia_producto_descripcion, m.jerarquia_producto_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_material1))
        /*[27]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_material1, rep, m.grupo_material1_borrador, m.grupo_material1, m.grupo_material1_descripcion, m.grupo_material1_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_material2))
        /*[28]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_material2, rep, m.grupo_material2_borrador, m.grupo_material2, m.grupo_material2_descripcion, m.grupo_material2_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.texto_comercial))
        /*[29]*/rep = obtenerRepresentation(enums.codigo_interno.texto_comercial, rep, m.texto_comercial_borrador, null, m.texto_comercial, m.texto_comercial_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.verificacion_disponibilidad))
        /*[30]*/rep = obtenerRepresentation(enums.codigo_interno.verificacion_disponibilidad, rep, m.verificacion_disponibilidad_borrador, m.verificacion_disponibilidad, m.verificacion_disponibilidad_descripcion, m.verificacion_disponibilidad_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_transporte))
        /*[31]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_transporte, rep, m.grupo_transporte_borrador, m.grupo_transporte, m.grupo_transporte_descripcion, m.grupo_transporte_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_carga))
        /*[32]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_carga, rep, m.grupo_carga_borrador, m.grupo_carga, m.grupo_carga_descripcion, m.grupo_carga_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.stock_negativo))
        /*[33]*/rep = obtenerRepresentation(enums.codigo_interno.stock_negativo, rep, m.stock_negativo_borrador, null, m.stock_negativo, m.stock_negativo_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.formula_concreto))
        /*[34]*/rep = obtenerRepresentation(enums.codigo_interno.formula_concreto, rep, m.formula_concreto_borrador, null, m.formula_concreto, m.formula_concreto_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_compra))
        /*[35]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_compra, rep, m.grupo_compra_borrador, m.grupo_compra, m.grupo_compra_descripcion, m.grupo_compra_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.unidad_medida_pedido))
        /*[36]*/rep = obtenerRepresentation(enums.codigo_interno.unidad_medida_pedido, rep, m.unidad_medida_pedido, m.id_unidad_medida_pedido, m.unidad_medida_pedido_descripcion, m.unidad_medida_pedido_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.precio_estandar))
        /*[37]*/rep = obtenerRepresentation(enums.codigo_interno.precio_estandar, rep, m.precio_estandar_borrador, null, m.precio_estandar, m.precio_estandar_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.precio_variable))
        /*[38]*/rep = obtenerRepresentation(enums.codigo_interno.precio_variable, rep, m.precio_variable_borrador, null, m.precio_variable, m.precio_variable_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.categoria_valoracion))
        /*[39]*/rep = obtenerRepresentation(enums.codigo_interno.categoria_valoracion, rep, m.categoria_valoracion_borrador, m.categoria_valoracion, m.categoria_valoracion_descripcion, m.categoria_valoracion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.control_precio))
        /*[40]*/rep = obtenerRepresentation(enums.codigo_interno.control_precio, rep, m.control_precio_borrador, m.control_precio, m.control_precio_descripcion, m.control_precio_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.determinacion_precio))
        /*[41]*/rep = obtenerRepresentation(enums.codigo_interno.determinacion_precio, rep, m.determinacion_precio_borrador, m.determinacion_precio, m.determinacion_precio_descripcion, m.determinacion_precio_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.unidad_medida_almacen))
        /*[42]*/rep = obtenerRepresentation(enums.codigo_interno.unidad_medida_almacen, rep, m.unidad_medida_almacen, m.id_unidad_medida_almacen, m.unidad_medida_almacen_descripcion, m.unidad_medida_almacen_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.ubicacion))
        /*[43]*/rep = obtenerRepresentation(enums.codigo_interno.ubicacion, rep, m.ubicacion_borrador, null, m.ubicacion, m.ubicacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.dcto_pronto_pago))
        /*[44]*/rep = obtenerRepresentation(enums.codigo_interno.dcto_pronto_pago, rep, m.dcto_pronto_pago_borrador, null, m.dcto_pronto_pago, m.dcto_pronto_pago_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_planif_necesidades))
        /*[45]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_planif_necesidades, rep, m.grupo_planif_necesidades_borrador, m.grupo_planif_necesidades, m.grupo_planif_necesidades_descripcion, m.grupo_planif_necesidades_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.tipo_mrp_caract_plani))
        /*[46]*/rep = obtenerRepresentation(enums.codigo_interno.tipo_mrp_caract_plani, rep, m.tipo_mrp_caract_plani_borrador, m.tipo_mrp_caract_plani, m.tipo_mrp_caract_plani_descripcion, m.tipo_mrp_caract_plani_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.planif_necesidades))
        /*[47]*/rep = obtenerRepresentation(enums.codigo_interno.planif_necesidades, rep, m.planif_necesidades_borrador, m.planif_necesidades, m.planif_necesidades_descripcion, m.planif_necesidades_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.calculo_tamano_lote))
        /*[48]*/rep = obtenerRepresentation(enums.codigo_interno.calculo_tamano_lote, rep, m.calculo_tamano_lote_borrador, m.calculo_tamano_lote, m.calculo_tamano_lote_descripcion, m.calculo_tamano_lote_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.clase_aprovis))
        /*[68]*/rep = obtenerRepresentation(enums.codigo_interno.clase_aprovis, rep, m.clase_aprovis_borrador, m.clase_aprovis, m.clase_aprovis_descripcion, m.clase_aprovis_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.aprovis_especial))
        /*[69]*/rep = obtenerRepresentation(enums.codigo_interno.aprovis_especial, rep, m.aprovis_especial_borrador, m.aprovis_especial, m.aprovis_especial_descripcion, m.aprovis_especial_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.toma_retrograda))
        /*[70]*/rep = obtenerRepresentation(enums.codigo_interno.toma_retrograda, rep, m.toma_retrograda_borrador, m.toma_retrograda, m.toma_retrograda_descripcion, m.toma_retrograda_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.almacen_produccion))
        /*[71]*/rep = obtenerRepresentation(enums.codigo_interno.almacen_produccion, rep, m.almacen_produccion_borrador, m.almacen_produccion, m.almacen_produccion_descripcion, m.almacen_produccion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.co_producto))
        /*[73]*/rep = obtenerRepresentation(enums.codigo_interno.co_producto, rep, m.co_producto_borrador, null, m.co_producto, m.co_producto_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.tiempo_fab_propia_pn2))
        /*[74]*/rep = obtenerRepresentation(enums.codigo_interno.tiempo_fab_propia_pn2, rep, m.tiempo_fab_propia_pn2_borrador, null, m.tiempo_fab_propia_pn2, m.tiempo_fab_propia_pn2_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.plaza_entrega_prev))
        /*[75]*/rep = obtenerRepresentation(enums.codigo_interno.plaza_entrega_prev, rep, m.plaza_entrega_prev_borrador, null, m.plaza_entrega_prev, m.plaza_entrega_prev_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.clave_horizonte))
        /*[76]*/rep = obtenerRepresentation(enums.codigo_interno.clave_horizonte, rep, m.clave_horizonte_borrador, m.clave_horizonte, m.clave_horizonte_descripcion, m.clave_horizonte_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.stock_seguridad_pn2))
        /*[77]*/rep = obtenerRepresentation(enums.codigo_interno.stock_seguridad_pn2, rep, m.stock_seguridad_pn2_borrador, null, m.stock_seguridad_pn2, m.stock_seguridad_pn2_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.stock_seguridad_min_pn2))
        /*[78]*/rep = obtenerRepresentation(enums.codigo_interno.stock_seguridad_min_pn2, rep, m.stock_seguridad_min_pn2_borrador, null, m.stock_seguridad_min_pn2, m.stock_seguridad_min_pn2_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.nivel_servicio_pn2))
        /*[79]*/rep = obtenerRepresentation(enums.codigo_interno.nivel_servicio_pn2, rep, m.nivel_servicio_pn2_borrador, null, m.nivel_servicio_pn2, m.nivel_servicio_pn2_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.indicador_periodo))
        /*[80]*/rep = obtenerRepresentation(enums.codigo_interno.indicador_periodo, rep, m.indicador_periodo_borrador, m.indicador_periodo, m.indicador_periodo_descripcion, m.indicador_periodo_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grupo_estrategia))
        /*[81]*/rep = obtenerRepresentation(enums.codigo_interno.grupo_estrategia, rep, m.grupo_estrategia_borrador, m.grupo_estrategia, m.grupo_estrategia_descripcion, m.grupo_estrategia_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.planf_neces_mixtas))
        /*[82]*/rep = obtenerRepresentation(enums.codigo_interno.planf_neces_mixtas, rep, m.planf_neces_mixtas_borrador, m.planf_neces_mixtas, m.planf_neces_mixtas_descripcion, m.planf_neces_mixtas_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.individual_colectivo))
        /*[83]*/rep = obtenerRepresentation(enums.codigo_interno.individual_colectivo, rep, m.individual_colectivo_borrador, m.individual_colectivo, m.individual_colectivo_descripcion, m.individual_colectivo_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.rechazo_componente))
        /*[84]*/rep = obtenerRepresentation(enums.codigo_interno.rechazo_componente, rep, m.rechazo_componente_borrador, null, m.rechazo_componente, m.rechazo_componente_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.sujeto_lote))
        /*[85]*/rep = obtenerRepresentation(enums.codigo_interno.sujeto_lote, rep, m.sujeto_lote_borrador, null, m.sujeto_lote, m.sujeto_lote_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.responsable_control_produccion))
        /*[86]*/rep = obtenerRepresentation(enums.codigo_interno.responsable_control_produccion, rep, m.responsable_control_produccion, m.id_responsable_control_produccion, m.responsable_control_produccion_descripcion, m.responsable_control_produccion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.perfil_control_fabricacion))
        /*[87]*/rep = obtenerRepresentation(enums.codigo_interno.perfil_control_fabricacion, rep, m.perfil_control_fabricacion, m.id_perfil_control_fabricacion, m.perfil_control_fabricacion_descripcion, m.perfil_control_fabricacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.unidad_medida_fabricacion))
        /*[88]*/ rep = obtenerRepresentation(enums.codigo_interno.unidad_medida_fabricacion, rep, m.unidad_medida_fabricacion, m.id_unidad_medida_fabricacion, m.unidad_medida_fabricacion_descripcion, m.unidad_medida_fabricacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.limite_exceso_sum_ilimitado))
        /*[89]*/rep = obtenerRepresentation(enums.codigo_interno.limite_exceso_sum_ilimitado, rep, m.limite_exceso_sum_ilimitado_borrador, null, m.limite_exceso_sum_ilimitado, m.limite_exceso_sum_ilimitado_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.modelo_pronostico))
        /*[91]*/rep = obtenerRepresentation(enums.codigo_interno.modelo_pronostico, rep, m.modelo_pronostico_borrador, m.modelo_pronostico, m.modelo_pronostico_descripcion, m.modelo_pronostico_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.periodo_pasado))
        /*[92]*/rep = obtenerRepresentation(enums.codigo_interno.periodo_pasado, rep, m.periodo_pasado_borrador, null, m.periodo_pasado, m.periodo_pasado_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.periodo_pronostico))
        /*[93]*/rep = obtenerRepresentation(enums.codigo_interno.periodo_pronostico, rep, m.periodo_pronostico_borrador, null, m.periodo_pronostico, m.periodo_pronostico_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.inicializacion))
        /*[94]*/rep = obtenerRepresentation(enums.codigo_interno.inicializacion, rep, m.inicializacion_borrador, null, m.inicializacion, m.inicializacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.limite_alarma))
        /*[95]*/rep = obtenerRepresentation(enums.codigo_interno.limite_alarma, rep, m.limite_alarma_borrador, null, m.limite_alarma, m.limite_alarma_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.grado_optimizacion))
        /*[96]*/rep = obtenerRepresentation(enums.codigo_interno.grado_optimizacion, rep, m.grado_optimizacion_borrador, null, m.grado_optimizacion, m.grado_optimizacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.proc_sel_modelo))
        /*[97]*/rep = obtenerRepresentation(enums.codigo_interno.proc_sel_modelo, rep, m.proc_sel_modelo_borrador, null, m.proc_sel_modelo, m.proc_sel_modelo_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.estructura_cuantica))
        /*[100]*/rep = obtenerRepresentation(enums.codigo_interno.estructura_cuantica, rep, m.estructura_cuantica_borrador, null, m.estructura_cuantica, m.estructura_cuantica_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.origen_material))
        /*[101]*/rep = obtenerRepresentation(enums.codigo_interno.origen_material, rep, m.origen_material_borrador, null, m.origen_material, m.origen_material_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.tamano_lote))
        /*[102]*/rep = obtenerRepresentation(enums.codigo_interno.tamano_lote, rep, m.tamano_lote_borrador, null, m.tamano_lote, m.tamano_lote_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.criticos))
        /*[108]*/rep = obtenerRepresentation(enums.codigo_interno.criticos, rep, m.criticos_borrador, null, m.criticos, m.criticos_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.estrategicos))
        /*[109]*/rep = obtenerRepresentation(enums.codigo_interno.estrategicos, rep, m.estrategicos_borrador, null, m.estrategicos, m.estrategicos_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.ump_var))
        /*[110]*/rep = obtenerRepresentation(enums.codigo_interno.ump_var, rep, m.ump_var_borrador, null, m.ump_var, m.ump_var_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.cantidad_base))
        /*[111]*/rep = obtenerRepresentation(enums.codigo_interno.cantidad_base, rep, m.cantidad_base_borrador, null, m.cantidad_base, m.cantidad_base_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.idioma))
        /*[112]*/rep = obtenerRepresentation(enums.codigo_interno.idioma, rep, m.idioma_borrador, m.idioma, m.idioma_descripcion, m.idioma_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.ampliacion))
        /*[113]*/rep = obtenerRepresentation(enums.codigo_interno.ampliacion, rep, m.ampliacion_borrador, null, m.ampliacion, m.ampliacion_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.precio_base))
        /*[114]*/rep = obtenerRepresentation(enums.codigo_interno.precio_base, rep, m.precio_base_borrador, null, m.precio_base, m.precio_base_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.moneda))
        /*[115]*/rep = obtenerRepresentation(enums.codigo_interno.moneda, rep, m.moneda_borrador, null, m.moneda, m.moneda_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.ind_ped_automa))
        /*[116]*/rep = obtenerRepresentation(enums.codigo_interno.ind_ped_automa, rep, m.ind_ped_automa_borrador, null, m.ind_ped_automa, m.ind_ped_automa_error);
    if (campos.some(e => e.codigo_interno === enums.codigo_interno.exceso_sum_ilimitado))
        /*[117]*/rep = obtenerRepresentation(enums.codigo_interno.exceso_sum_ilimitado, rep, m.exceso_sum_ilimitado_borrador, null, m.exceso_sum_ilimitado, m.exceso_sum_ilimitado_error);

    if (campos.some(e => e.codigo_interno === enums.codigo_interno.clasificacion_tab)) {
        const clasificacionesPorMaterial = list_clasificacion.filter(function (item) {
            return item.id_material_solicitud === m.id_material_solicitud;
        });

        let ids = "";
        let valores = "";
        let descripciones = "";
        let error = false;

        clasificacionesPorMaterial.forEach(clasificacion => {
            ids = ids.concat(clasificacion.id_clasificacion, ",")
            valores = valores.concat(clasificacion.clasificacion_borrador, ",")
            descripciones = descripciones.concat(clasificacion.nombre, ",");
            error = clasificacion.error ? clasificacion.error : error;
        });

        rep[enums.codigo_interno.clasificacion_tab] = descripciones.substring(0, descripciones.length - 1);
        rep[enums.codigo_interno.clasificacion_tab + "_valor"] = valores.substring(0, valores.length - 1);
        rep[enums.codigo_interno.clasificacion_tab + "_id"] = ids.substring(0, ids.length - 1);
        rep[enums.codigo_interno.clasificacion_tab + "_descripcion"] = descripciones.substring(0, descripciones.length - 1);
        rep[enums.codigo_interno.clasificacion_tab + "_error"] = error;
        rep[enums.codigo_interno.clasificacion_tab + "_visible"] = true;
    }

    if (campos.some(e => e.codigo_interno === enums.codigo_interno.area_planificacion_tab)) {
        const area_planificacionPorMaterial = list_area_planificacion.filter(function (item) {
            return item.id_material_solicitud === m.id_material_solicitud;
        });

        let valores = "";
        let descripciones = "";
        let error = false;

        area_planificacionPorMaterial.forEach(area_planificacion => {
            valores = valores.concat(area_planificacion.area_planificacion_borrador, ",");
            descripciones = descripciones.concat(area_planificacion.nombre, ",");
            error = area_planificacion.error ? area_planificacion.error : error;
        });

        rep[enums.codigo_interno.area_planificacion_tab] = descripciones.substring(0, descripciones.length - 1);
        rep[enums.codigo_interno.area_planificacion_tab + "_valor"] = valores.substring(0, valores.length - 1);
        rep[enums.codigo_interno.area_planificacion_tab + "_id"] = null;
        rep[enums.codigo_interno.area_planificacion_tab + "_descripcion"] = descripciones.substring(0, descripciones.length - 1);
        rep[enums.codigo_interno.area_planificacion_tab + "_error"] = error;
        rep[enums.codigo_interno.area_planificacion_tab + "_visible"] = true;
    }

    if (campos.some(e => e.codigo_interno === enums.codigo_interno.clase_inspeccion_tab)) {
        const clase_inspeccionPorMaterial = list_clase_inspeccion.filter(function (item) {
            return item.id_material_solicitud === m.id_material_solicitud;
        });

        let ids = "";
        let valores = "";
        let descripciones = "";
        let error = false;

        clase_inspeccionPorMaterial.forEach(clase_inspeccion => {
            ids = ids.concat(clase_inspeccion.id_clase_inspeccion, ",")
            valores = valores.concat(clase_inspeccion.clase_inspeccion_borrador, ",")
            descripciones = descripciones.concat(clase_inspeccion.nombre, ",");
            error = clase_inspeccion.error ? clase_inspeccion.error : error;
        });

        rep[enums.codigo_interno.clase_inspeccion_tab] = descripciones.substring(0, descripciones.length - 1);
        rep[enums.codigo_interno.clase_inspeccion_tab + "_valor"] = valores.substring(0, valores.length - 1);
        rep[enums.codigo_interno.clase_inspeccion_tab + "_id"] = ids.substring(0, ids.length - 1);
        rep[enums.codigo_interno.clase_inspeccion_tab + "_descripcion"] = descripciones.substring(0, descripciones.length - 1);
        rep[enums.codigo_interno.clase_inspeccion_tab + "_error"] = error;
        rep[enums.codigo_interno.clase_inspeccion_tab + "_visible"] = true;
    }

    rep["acciones"] = constantes.emptyString;
    rep["mensaje_error_sap"] = m.mensaje_error_sap;
    rep["existe_error_sap"] = m.existe_error_sap;
    rep["material_codigo_modelo"] = m.material_codigo_modelo;

    return rep
};

function existeDenominacionExacta(nombresExistentes, denominacion) {
    let flag = false;
    if (nombresExistentes.length > 0) {
        nombresExistentes.forEach(material => {
            if (material.denominacion === denominacion) {
                flag = true;
            }
        });
    }
    return flag;
};

function existeRegla(codigo_interno, reglas) {
    let flag = false;

    reglas.forEach(campo => {
        if (campo.codigo_interno === codigo_interno) {
            flag = true;
            return;
        }
    });

    return flag;
};

function existeCampo(codigo_interno, campos) {
    let flag = false;

    campos.forEach(campo => {
        if (campo.codigo_interno === codigo_interno) {
            flag = true;
            return;
        }
    });

    return flag;
};

function obtenerCampo(codigo_interno, campos) {
    let result = null;

    campos.forEach(campo => {
        if (campo.codigo_interno === codigo_interno) {
            result = campo;
            return;
        }
    });

    return result;
};

function removerCampo(codigo_interno, campos) {
    const filtered = campos.filter(function (value, index, arr) {
        return value.codigo_interno !== codigo_interno;
    });

    return filtered
};

function obtener_centro_codigo_sap(campos, obj_material) {
    let result = null;

    campos.forEach(campo => {
        if (campo.codigo_interno === enums.codigo_interno.centro_codigo_sap) {
            result = campo.valor;
            return result;
        }
    });

    if (obj_material && result == null) {
        result = obj_material.centro_codigo_sap;
    }

    return result;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

function existeEnLista(list, valor) {

    list.forEach(element => {
        if (element === valor) {
            return true;
        }
    });

    return false;
};

function obtenerCampoValor(codigo_interno, campos) {
    let result = null;

    for (let index = 0; index < campos.length; index++) {
        const campo = campos[index];

        if (campo.codigo_interno === codigo_interno) {
            if (campo.codigo_interno === enums.codigo_interno.area_planificacion_tab) {
                result = campo.valores[0].valor;
                break;
            }
            result = campo.valor;
            break;
        }
    }

    return result;
};
//#endregion

module.exports = controller;