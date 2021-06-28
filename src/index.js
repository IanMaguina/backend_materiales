const winston = require('./utils/winston');
const express = require('express');
const morgan = require('morgan');

const app = express();

// middlewares
app.use(morgan('combined', { stream: { write: message => winston.info(message.trim()) }}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//for cors
app.use(function(req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});

// Routes
app.use('/almacen', require('./routes/almacenRouter'));
app.use('/archivo', require('./routes/archivoRouter'));
app.use('/canalDistribucion', require('./routes/canalDistribucionRouter'));
app.use('/campo', require('./routes/campoRouter'));
app.use('/centro', require('./routes/centroRouter'));
app.use('/centroBeneficio', require('./routes/centroBeneficioRouter'));
app.use('/estrategia', require('./routes/estrategiaRouter'));
app.use('/clasificacion', require('./routes/clasificacionRouter'));
app.use('/maestro/areaUsuario', require('./routes/areaUsuarioRouter'));
app.use('/maestro/escenarioNivel1', require('./routes/escenarioNivel1Router'));
app.use('/maestro/escenarioNivel2', require('./routes/escenarioNivel2Router'));
app.use('/maestro/escenarioNivel3', require('./routes/escenarioNivel3Router'));
app.use('/maestro/perfilUsuario', require('./routes/perfilUsuarioRouter'));
app.use('/maestro/tipoMaterial', require('./routes/tipoMaterialRouter'));
app.use('/maestro/tipoSolicitud', require('./routes/tipoSolicitudRouter'));
app.use('/maestro/sociedad', require('./routes/sociedadRouter'));
app.use('/maestro/unidadMedida', require('./routes/unidadMedidaRouter'));
app.use('/organizacionVenta', require('./routes/organizacionVentaRouter'));
app.use('/ramo', require('./routes/ramoRouter'));
app.use('/usuario', require('./routes/usuarioRouter'));
app.use('/vistaPortal', require('./routes/vistaPortalRouter'));
app.use('/solicitud', require('./routes/solicitudRouter'));
app.use('/notificaion', require('./routes/notificacionRouter'));
app.use('/rol', require('./routes/rolRouter'));
app.use('/materialSolicitud', require('./routes/materialSolicitudRouter'));
app.use('/maestro/responsableControlProduccion', require('./routes/responsableControlProduccionRouter'));
app.use('/maestro/perfilControlFabricacion', require('./routes/perfilControlFabricacionRouter'));
app.use('/maestro/categoriaValoracion', require('./routes/categoriaValoracionRouter'));
app.use('/maestro/grupoEstadisticaMat', require('./routes/grupoEstadisticaMatRouter'));
app.use('/maestro/grupoImputacionMaterial', require('./routes/grupoImputacionMaterialRouter'));
app.use('/maestro/jerarquiaProducto', require('./routes/jerarquiaProductoRouter'));
app.use('/maestro/grupoMaterial1', require('./routes/grupoMaterial1Router'));
app.use('/maestro/grupoMaterial2', require('./routes/grupoMaterial2Router'));
app.use('/maestro/motivoRechazo', require('./routes/motivoRechazoRouter'));
app.use('/maestro/grupoTransporte', require('./routes/grupoTransporteRouter'));
app.use('/maestro/grupoCarga', require('./routes/grupoCargaRouter'));
app.use('/maestro/grupoCompra', require('./routes/grupoCompraRouter'));
app.use('/maestro/grupoArticulo', require('./routes/grupoArticuloRouter'));
app.use('/maestro/idioma', require('./routes/idiomaRouter'));
app.use('/maestro/grupoTipoPosicion', require('./routes/grupoTipoPosicionRouter'));
app.use('/maestro/partidaArancelaria', require('./routes/partidaArancelariaRouter'));
app.use('/seguridad', require('./routes/seguridadRouter'));
app.use('/estadoSolicitud', require('./routes/estadoSolicitudRouter'));
app.use('/sap', require('./routes/sapRouter'));
app.use('/sapJobs', require('./routes/sapJobsRouter'));
app.use('/claseInspeccion', require('./routes/claseInspeccionRouter'));
app.use('/areaPlanificacion', require('./routes/areaPlanificacionRouter'));

// Export the app instance
module.exports = app;
