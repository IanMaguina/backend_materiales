const router = require('express').Router();

const usuarioController = require('../controllers/usuarioController');

// crear
router.post('/crear', usuarioController.crear);

router.get('/listarTodo', usuarioController.listarTodo);

router.post('/actualizarActivo', usuarioController.actualizarActivo);

router.post('/listarPorFiltros', usuarioController.listarPorFiltros);

router.post('/actualizar', usuarioController.actualizar);

router.get('/buscarDatosDeEstrategiaDeUsuario', usuarioController.buscarDatosDeEstrategiaDeUsuario);

router.get('/listarPerfilesPendientes', usuarioController.listarPerfilesPendientes);

router.get('/listarPerfiles', usuarioController.listarPerfiles);

router.post('/asignarPerfilAUsuario', usuarioController.asignarPerfilAUsuario);

router.post('/eliminarPerfilDeUsuario', usuarioController.eliminarPerfilDeUsuario);

module.exports = router;