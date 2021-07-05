const winston = require('../utils/winston');
const fetch = require("node-fetch");
const config = require('../config');
const constantes = require("../utils/constantes");
const enums = require("../utils/enums");
const utility = require("../utils/utility");
const service = {};

//constante para mapear las tablas del RFC con la base de datos.


const tablas = [
    {
        "rfc_table": "TI_MDLV",
        "campos_rfc": "BERID¬WERZG¬ORTZG¬BERTX",
        "bd_table": "dino.tarea_planificacion",
        "campos": "(codigo_sap, centro_codigo_sap, almacen_codigo_sap, nombre)",
        "nro_campos": "($1, $2, $3, $4)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_T001W",
        "campos_rfc": "WERKS¬NAME1¬BUKRS",
        "bd_table": "dino.tcentro",
        "campos": "(codigo_sap, nombre, codigo_sociedad)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_T001L",
        "campos_rfc": "WERKS¬LGORT¬TEXT40",
        "bd_table": "dino.talmacen",
        "campos": "(centro_codigo_sap, codigo_sap, nombre)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(codigo_sap, centro_codigo_sap)"
    },
    {
        "rfc_table": "TI_TVKM",
        "campos_rfc": "KTGRM¬VTEXT",
        "bd_table": "dino.tgrupo_imputacion_material",
        "campos": "(codigo_sap, nombre)",
        "nro_campos": "($1, $2)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_T179",
        "campos_rfc": "PRODH¬VTEXT",
        "bd_table": "dino.tjerarquia_producto",
        "campos": "(codigo_sap, nombre)",
        "nro_campos": "($1, $2)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_CEPC",
        "campos_rfc": "PRCTR¬KTEXT¬BUKRS",
        "bd_table": "dino.tcentro_beneficio",
        "campos": "(codigo_sap, nombre, codigo_sociedad)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_T025",
        "campos_rfc": "BKLAS¬BKBEZ¬KKREF",
        "bd_table": "dino.tcategoria_valoracion",
        "campos": "(codigo_sap, nombre, referencia_cuenta)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_T438M",
        "campos_rfc": "WERKS¬MTART¬TEXT40",
        "bd_table": "dino.tgrupo_planif_necesidades",
        "campos": "(centro_codigo_sap, codigo_sap, nombre)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(codigo_sap)"
    },
    {
        "rfc_table": "TI_T024D",
        "campos_rfc": "WERKS¬DISPO¬DSNAM",
        "bd_table": "dino.tplanif_necesidades",
        "campos": "(centro_codigo_sap, codigo_sap, nombre)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(centro_codigo_sap, codigo_sap)"
    },
    {
        "rfc_table": "TI_T460A",
        "campos_rfc": "WERKS¬SOBSL¬LTEXT",
        "bd_table": "dino.taprovis_especial",
        "campos": "(centro_codigo_sap, codigo_sap, nombre)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(centro_codigo_sap, codigo_sap)"
    },
    {
        "rfc_table": "TI_T436A",
        "campos_rfc": "WERKS¬FHORI",
        "bd_table": "dino.tclave_horizonte",
        "campos": "(centro_codigo_sap, codigo_sap)",
        "nro_campos": "($1, $2)",
        "name_key": "(centro_codigo_sap, codigo_sap)"
    },
    {
        "rfc_table": "TI_T024F",
        "campos_rfc": "WERKS¬FEVOR¬TXT",
        "bd_table": "dino.tresponsable_control_produccion",
        "campos": "(centro_codigo_sap, codigo_sap, nombre)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(centro_codigo_sap, codigo_sap)"
    },
    {
        "rfc_table": "TI_TCO43",
        "campos_rfc": "WERKS¬CO_PRODPRF¬PRODPRF_TX",
        "bd_table": "dino.tperfil_control_fabricacion",
        "campos": "(centro_codigo_sap, codigo_sap,nombre)",
        "nro_campos": "($1, $2, $3)",
        "name_key": "(centro_codigo_sap, codigo_sap)"
    }

];



//Funciones para limpiar y registrar nuevos datos.
function insertar_datos(tabla, campos, nro_campos, name_key, datos, client) {
    let query = "";
    switch (tabla) {
        case 'dino.tarea_planificacion':
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + " \
            DO UPDATE SET nombre = EXCLUDED.nombre, almacen_codigo_sap = EXCLUDED.almacen_codigo_sap, \
            centro_codigo_sap = EXCLUDED.centro_codigo_sap;";
            break;
        case 'dino.tcentro':
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + " \
            DO UPDATE SET nombre = EXCLUDED.nombre, codigo_sociedad = EXCLUDED.codigo_sociedad;";
            break;
        case 'dino.tcentro_beneficio':
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + " \
            DO UPDATE SET nombre = EXCLUDED.nombre, codigo_sociedad = EXCLUDED.codigo_sociedad;";
            break;
        case 'dino.tclave_horizonte':
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + ' DO NOTHING;';
            break;
        case 'dino.tcategoria_valoracion':
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + " \
            DO UPDATE SET nombre = EXCLUDED.nombre, referencia_cuenta = EXCLUDED.referencia_cuenta;";
            break;
        default:
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + " \
            DO UPDATE SET nombre = EXCLUDED.nombre;";
            break;
    }
    /*     if (campos.split("nombre").length > 1) {
            query = 'INSERT INTO ' + tabla + campos + ' VALUES ' + nro_campos + ' ON CONFLICT ' + name_key + " \
            DO UPDATE SET nombre = EXCLUDED.nombre;";
        } else {
            query = 'INSERT INTO ' + tabla + campos + ' VALUES' + nro_campos + ' ON CONFLICT ' + name_key + ' DO NOTHING;';
        }*/
    //winston.error(tabla + " QUERY: *******************" + query + " --- " + JSON.stringify(datos));
    c = 0;
    return new Promise((resolve, reject) => {
        client.query(query, datos, (err, res) => {
            if (err) {
                winston.error("SUPER ERROR: *******************" + err);
                //console.log(err);
                reject(err);
            } else {
                c++;
                winston.error("INSERTO O ACTUALIZO *******************" + tabla + ' registros:' + c);
                resolve(true);
            }
        });
    });
}



service.JobsCargaMaestros = async (client) => {
    var host = config.cpsaaSapApi.hostJobsCargaMaestros;
    let servicio = fetch(host, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.cpsaaSapApi.token
        },
        cache: 'no-cache'
    });

    //Inicio de la operación
    let result = { codigo: 0, mensaje: 'Error al ejecutar Jobs' };
    var promesas = [];
    servicio.then(res => res.json())
        .then(json => {
            tablas.forEach(element => {
                //console.log(element.rfc_table);
                let tablas_rfc = json.resultado[element.rfc_table];
                tablas_rfc.forEach(element_rfc => {
                    let campos_rfc = element.campos_rfc.split("¬");
                    var datos = [];
                    campos_rfc.forEach(camp_rfc => {
                        datos.push(element_rfc[camp_rfc]);
                    });
                    promesas.push(insertar_datos(element.bd_table, element.campos, element.nro_campos, element.name_key, datos, client));
                });
                if (element.rfc_table == 'TI_T001W') {
                    setTimeout(function () { console.log(Date.now()); }, 2000);
                }
            });
            result.mensaje = "OK";
            result.codigo = 1;

        })
        .then(() => {
            Promise.all(promesas)
                .then(() => {
                    client.end();
                    winston.error("Finalizo:" + promesas.length);
                })
                .catch(err => {
                    client.end();
                    result.mensaje = err;
                    result.codigo = 0;
                    console.log(err);
                });
        })
        .catch(err => {
            //client.end();
            result.mensaje = err;
            result.codigo = 0;
            console.log(err);
        });


    return result;
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