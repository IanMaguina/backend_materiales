const postgresConn = require('../connections/postgres');
const winston = require('../utils/winston');
const vistaPortalService = require('../services/vistaPortalService');
const VistaPortal = require('../domain/vistaPortal');
const Campo = require('../domain/campo');
const vistaPortalController = {};

vistaPortalController.listar = async (req, res) => {
    try {
        const response = {
            resultado: 0,
            mensaje: "Error inesperado al obtener Vistas."
        };

        let { id_escenario_nivel3, id_rol, id_tipo_solicitud } = req.query;

        const vistaPortalServiceRes = await vistaPortalService.listar(postgresConn, id_escenario_nivel3, id_rol, id_tipo_solicitud);

        if (vistaPortalServiceRes) {
            response.resultado = 1;
            response.mensaje = "";

            const vistas = [];

            vistaPortalServiceRes.forEach(element => {
                var vista = vistas.find(x => x.id_vista_portal == element.id_vista_portal);

                if (!vista) {
                    vista = new VistaPortal({
                        id_vista_portal: element.id_vista_portal,
                        nombre: element.nombre_vista,
                        regla_vista: element.regla_vista,
                    });

                    vistas.push(vista);
                }

                const campo = new Campo({
                    id: element.id_campo_vista,
                    nombre: element.nombre_campo,
                    regla_campo: element.regla_campo,
                    orden: element.orden_campo,
                    tipo_objeto: element.tipo_objeto,
                    valor_defecto: element.valor_defecto,
                    tabla_maestra: element.tabla_maestra,
                    tipo_dato: element.tipo_dato,
                    longitud: Number(element.longitud),
                    longitud_decimal:element.longitud_decimal,
                    etiqueta: element.etiqueta,
                    codigo_interno: element.codigo_interno
                });

                vista.campos.push(campo);
            });



            response.lista = vistas;
        }
        res.status(200).json(response);
    } catch (error) {
        winston.info("Error en vistaPortalController.listar,", error);
        res.status(500).send(error);
    }
};

module.exports = vistaPortalController;