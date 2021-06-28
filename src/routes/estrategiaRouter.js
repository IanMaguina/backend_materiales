const router = require('express').Router();

const estrategiaController = require('../controllers/estrategiaController');

// listar por filtros
router.post('/listarPorFiltros', estrategiaController.listarPorFiltros);

// crear estrategia
router.post('/crear', estrategiaController.crear);

// listar roles que faltan en la estrategia
router.get('/listarRolesQueFaltanEnEstrategia', estrategiaController.listarRolesQueFaltanEnEstrategia);

// listar EstrategiaRol y Rol por id_estrategia
router.get('/listarEstrategiaRolYRolPorId', estrategiaController.listarEstrategiaRolYRolPorId);

// Agregar Rol al Escenario
router.post('/crearEstrategiaRol', estrategiaController.crearEstrategiaRol);

// Listar usuarios de una Estrategia y rol que esten activos, para que muestre mensaje de confirmacion
router.get('/listarUsuariosActivosDeEstrategiaRolPorIdEstrategiaRol', estrategiaController.listarUsuariosActivosDeEstrategiaRolPorIdEstrategiaRol);

// actualizar estado del rol en una Estrategia
router.post('/actualizarActivoDeEstrategiaRol', estrategiaController.actualizarActivoDeEstrategiaRol);

// actualizar listado de Roles por Estrategia
router.post('/actualizarRolesDeEstrategia', estrategiaController.actualizarRolesDeEstrategia);

// Listar los usuarios con su rol que ya esten asignados a una estrategia
router.get('/listarUsuarioConRolPorIdEstrategia', estrategiaController.listarUsuarioConRolPorIdEstrategia);

// Listar Roles activos de la Estrategia, que no tengan usuario asignado con excepcion de Solicitante
router.get('/listarRolesActivosDeEstrategiaSinUsuarioExceptoSolicitantePorId', estrategiaController.listarRolesActivosDeEstrategiaSinUsuarioExceptoSolicitantePorId);

// Listar usuarios que no esten asignados a un rol de la estrategia
router.get('/listarUsuariosQueNoEstanAsignadosAUnaEstrategiaPorId', estrategiaController.listarUsuariosQueNoEstanAsignadosAUnaEstrategiaPorId);

// Agregar usuario a un Rol de una Estrategia
router.post('/agregarUsuarioARolDeEstrategia', estrategiaController.agregarUsuarioARolDeEstrategia);

// actualizar estado de un usuario de un rol de una Estrategia
router.post('/actualizarActivoDeEstrategiaRolUsuario', estrategiaController.actualizarActivoDeEstrategiaRolUsuario);

// Agregar Correo al estrategia
router.post('/crearEstrategiaCorreo', estrategiaController.crearEstrategiaCorreo);

// Listar Correos estrategia
router.get('/listarEstrategiaCorreo', estrategiaController.listarEstrategiaCorreo);

// Eliminar Correos x Id estrategia correo
router.post('/eliminarPorId', estrategiaController.eliminarPorId);

module.exports = router;