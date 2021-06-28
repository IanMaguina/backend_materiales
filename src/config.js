const path = require('path');
const config = {};
//const INSTANCIA_CLOUD_DB=(process.env.NODE_ENV=='production'?`${process.env.DB_SOCKET_PATH}/${process.env.INSTANCE_CONNECTION_NAME}`: '10.10.0.39');
const INSTANCIA_CLOUD_DB = (process.env.DB_SOCKET_PATH ? `${process.env.DB_SOCKET_PATH}/${process.env.INSTANCE_CONNECTION_NAME}` : '10.10.0.18');

// config.postgres = {
//     user: process.env.SQL_USER || 'postgres',
//     password: 'oI1szyfnnxm5cC2N',
//     host: '34.68.69.211',
//     port: process.env.SQL_PORT || 5432,
//     database: process.env.SQL_DATABASE || 'sismat'
// }

config.postgres = {
    user: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || 'Pass_sigc-1',
    host: INSTANCIA_CLOUD_DB,//'10.10.0.39',
    port: process.env.SQL_PORT || 5432,
    database: process.env.SQL_DATABASE || 'sismat'
}

config.express = {
    port: process.env.EXPRESS_PORT || 8080,
    ip: '127.0.0.1'
}

config.winston = {
    ruta: `${__dirname}/../logs/log-api.log`
}

config.uploads = {
    ruta: path.join(__dirname, '../../tmp')
}

config.nodemailer = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'rsaenz.rrnconsulting@gmail.com',
    pass: 'rafael44332211',
    sender: '"Sistema de Materiales" <rrnconsulting@gmail.com>'
}

config.mailSubjects = {
    aprobacion: 'Solicitud {0} fue enviada para su aprobación',
    rechazo: 'Solicitud {0} fue rechazada',
    respuestaSAP: 'Solicitud Atendida',
    baseUrl:'https://ui-dot-pe-pacasmayo-portalmat-gcp.uk.r.appspot.com/{0}/verSolicitud/{1}/{2}'
}

config.cpsaaSapApi = {
    token: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNQVNDQVJBX0FQUCIsImlhdCI6MTYxNTQ3NDA5OCwiZXhwIjoxNjQ3MDEwMDk4LCJpc3MiOiJDZW1lbnRvcyBQYWNhbWF5byBTLkEuQS4ifQ.PpZcjbzTmE1mXlogPSlXXYK0EiRm_2p23-MjZE35k_TKQJb3_NpW0ZNnOMl9GwaNIliIlpD67ykHx8MIEiePweXGoHhki_p7XSrNh4pLBSgJSNmctVo1NJ_RW8394Qj5XsQ3bEn9-3dG9NNK8JcksdCFkATN22GKpw8_95KAgJx9fT5vUngcniBMzF_1Ar2setooNjMl9OxZ--OuU8br2-mbQQ2nEoVos_By10Ywt-SSFPri1yQbsa9hjlxfVJ4yzhYOBoBRvoEHnb9VRYQNsxMU4U_hcIJBHnPFRTQIiIF_2dRprnvPm80rCUJrH-bl1XQznISnnS9jkMpukqOWM7Ajm74KyOsoZwPVweXEfyCvqOZ18NFCyHWQfhaUWv6vEqWOTDQSc0FoKCgFK-_P29MK976SOhI9CLmLIyPEzk61rt4yjwcbx9dUYOTHeggVwuXeQe6Bpp6ec7Ys_ZATFP5WdNdtarfegCVBkri9yKy9nX2l34-8ZuzlFQEjai-NLg78e-GKuYEd2aHOeBSeqyInHO3nGD5ZgWg3ihdrNARXfvNZDaAUy-YRLzpuuMi7yoHQcOldSa6wG6Z5pywmG0udEZVwPG6OidTOl4ol_zW8pWQkxFsZuPLEFMVp8HGTycVQMH_Nc5UZjvVjK20vQlVOafCWpV4Q2Z8rzMdF-tk',
    host: 'https://integracion.cpsaa.com.pe/sap/maestros/',
    hostRegistrar: 'https://integracion.cpsaa.com.pe/sap/maestros/registrar-material',
    hostConsultaMaterialCodigo: 'https://integracion.cpsaa.com.pe/sap/maestros/consulta-material-codigo',
    hostConsultaMaterialNombre: 'https://integracion.cpsaa.com.pe/sap/maestros/consulta-material-nombre',
    hostJobsCargaMaestros:'https://integracion.cpsaa.com.pe/sap/maestros/maestros-materiales'

}

config.gcpCloudStorage = {
    keyFilename: path.join(__dirname, './credentials/gcpKey.json'),
    //projectId: "helpful-charmer-310816",
    projectId: "pe-pacasmayo-portalmat-gcp",
    //bucket: "sismat-files",
    bucket: "sismat-file",
    subirArchivo: {
        url: "https://integracion.cpsaa.com.pe/gcp/cloud_storage/subir-archivo",
        token: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7fSwic3ViIjoiU0lDLUFQUCIsImlhdCI6MTYxODE4OTIyNSwiZXhwIjoxNjE4ODgwNDI1LCJpc3MiOiJDZW1lbnRvcyBQYWNhbWF5byBTLkEuQS4ifQ.Yptn9Cmp8GV4kgR8aVkXfJ8Bx8kPP8GLIaFyIw3ymrhH4FEyPB9HFI68eNQ0F2E-jsJ3of9_ta2TeRRoG-u-ZDgjO60NFZNVTTNljbBxAQjbvkmpktC67hg7ge7m59FiHwjSsmJ_AsiznfeTMiI4xdp3gdxeNxrvnolfmtU9o_69zMuYYlxc4RFVVejgTF24lM6LPFHlKTmf3rybu2S935Yl8hPUWvU0ypOMDsB5O28q6fRqMPdyjqkxaalfOmk1Asb41hoJ8CS5uADb3NDgmNLAfT3POwog4RKQZZD-fNJN72MlEkFtALhtk5o9mLnO2-D4Aa9Jy9ZKHI1wE3mIlci3b0SkxvbnJVFq4JBxngAZ512MA0Vkp0DTX-hPqitMgLe7e9CqTizix0ImKGpwPtLTTMqnpiqORp3Zb-WbfHcVxN9ctCnr_wnACvAPcG1wvclO8HHJjSlIgb5yVuFhxqiA69xNbaFuavRpWOTT4XMkY8k3X-73Y9TSBV0pI0BxcVMEPsA_ZgRkg1kSYJIzAD_radg7xR9w8sarTxPmWssmFMWY4R_trGXWa3LBsCtGfPoXYqDJNFl-3lfiFEYA2Gmi7Qsz3c0JZrORFA7NEin7egZ5tFyNDMAMY8ZPLJPiHZWnYMfDb8BAIUMqZXvWb_KRFTxz7G5VdSb-R5_GXiE",
        params: {
            ruta: "doc-entrada",
            bucket: "stg-tramitedoc",
            file: null,
            proyecto: "mesa_partes"
        }
    },
    generarUrl: {
        url: "https://integracion.cpsaa.com.pe/gcp/cloud_storage/generar-url",
        token: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7fSwic3ViIjoiU0lDLUFQUCIsImlhdCI6MTYxODE4OTIyNSwiZXhwIjoxNjE4ODgwNDI1LCJpc3MiOiJDZW1lbnRvcyBQYWNhbWF5byBTLkEuQS4ifQ.Yptn9Cmp8GV4kgR8aVkXfJ8Bx8kPP8GLIaFyIw3ymrhH4FEyPB9HFI68eNQ0F2E-jsJ3of9_ta2TeRRoG-u-ZDgjO60NFZNVTTNljbBxAQjbvkmpktC67hg7ge7m59FiHwjSsmJ_AsiznfeTMiI4xdp3gdxeNxrvnolfmtU9o_69zMuYYlxc4RFVVejgTF24lM6LPFHlKTmf3rybu2S935Yl8hPUWvU0ypOMDsB5O28q6fRqMPdyjqkxaalfOmk1Asb41hoJ8CS5uADb3NDgmNLAfT3POwog4RKQZZD-fNJN72MlEkFtALhtk5o9mLnO2-D4Aa9Jy9ZKHI1wE3mIlci3b0SkxvbnJVFq4JBxngAZ512MA0Vkp0DTX-hPqitMgLe7e9CqTizix0ImKGpwPtLTTMqnpiqORp3Zb-WbfHcVxN9ctCnr_wnACvAPcG1wvclO8HHJjSlIgb5yVuFhxqiA69xNbaFuavRpWOTT4XMkY8k3X-73Y9TSBV0pI0BxcVMEPsA_ZgRkg1kSYJIzAD_radg7xR9w8sarTxPmWssmFMWY4R_trGXWa3LBsCtGfPoXYqDJNFl-3lfiFEYA2Gmi7Qsz3c0JZrORFA7NEin7egZ5tFyNDMAMY8ZPLJPiHZWnYMfDb8BAIUMqZXvWb_KRFTxz7G5VdSb-R5_GXiE",
        params: {
            filename: "doc_entrada/",
            bucket: "stg-tramitedoc",
            proyecto: "mesa_partes"
        }
    }
}

config.googleApi = {
    //clientId: '68121155157-tkutj29srn3cbe4o2f8qpqhhgql2jqh9.apps.googleusercontent.com',
    clientId: '3723124560-9b6f7hotqq80p7cean40228i8ea7j335.apps.googleusercontent.com',
}

config.constantesDb = {
    id_estado_solicitud_en_sap: 8,
    nombre_estado_solicitud_en_sap: "En SAP",
    id_rol_sap: 7,
    nombre_rol_sap: "SAP",
    id_usuario_sap: 3,
    id_estado_solicitud_finalizado:9
}

config.mensajeError = {
    generico: "Error en el proceso del Servicio."
}

config.retry = {
    maxRetries: 3,
    waitFor: 5000// milliseconds
}

module.exports = config;