const fetch = require('node-fetch');
const { Client } = require('pg');
require('dotenv').config();

//mover a un env si es posible en GCP Fuctions
const bd = {
  user: "postgres",
  password: "postgres",
  database: "temporal",
  host: "172.26.14.165",
  port: "5432",
  max: "100"
};

const client = new Client(bd);
client.connect();

//constante para mapear las tablas del RFC con la base de datos.
const tablas = [
 {
  "rfc_table": "TI_T001W",
  "campos_rfc":"WERKS¬NAME1",
  "bd_table": "dino.tcentro",
  "campos":"(codigo_sap, nombre)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap)"
},

{
  "rfc_table": "TI_TVKM",
  "campos_rfc":"KTGRM¬VTEXT",
  "bd_table": "dino.tgrupo_imputacion_material",
  "campos":"(codigo_sap, nombre)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap)"
},

{
  "rfc_table": "TI_T179",
  "campos_rfc":"PRODH¬VTEXT",
  "bd_table": "dino.tjerarquia_producto",
  "campos":"(codigo_sap, nombre)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap)"
},

{
  "rfc_table": "TI_CEPC",
  "campos_rfc":"KOKRS¬KTEXT",
  "bd_table": "dino.tcentro_beneficio",
  "campos":"(codigo_sap, nombre)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap)"
},

{
  "rfc_table": "TI_T025",
  "campos_rfc":"BKLAS¬BKBEZ",
  "bd_table": "dino.tcategoria_valoracion",
  "campos":"(codigo_sap, nombre)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap)"
},

{
  "rfc_table": "TI_T001L",
  "campos_rfc":"WERKS¬LGORT¬TEXT40",
  "bd_table": "dino.talmacen",
  "campos":"(codigo_centro, codigo_sap, nombre)",
  "nro_campos": "($1, $2, $3)",
  "name_key": "(codigo_sap, codigo_centro)"
},

{
  "rfc_table": "TI_T438M",
  "campos_rfc":"WERKS¬MTART¬TEXT40",
  "bd_table": "dino.tgrupo_planif_necesidades",
  "campos":"(codigo_centro, codigo_sap, nombre)",
  "nro_campos": "($1, $2, $3)",
  "name_key": "(codigo_sap, codigo_centro)"
},

{
  "rfc_table": "TI_T024D",
  "campos_rfc":"WERKS¬DISPO¬DSNAM",
  "bd_table": "dino.tplanif_necesidades",
  "campos":"(codigo_centro, codigo_sap, nombre)",
  "nro_campos": "($1, $2, $3)",
  "name_key": "(codigo_centro, codigo_sap)"
},

{
  "rfc_table": "TI_MDLV",
  "campos_rfc":"WERZG¬ORTZG¬BERTX",
  "bd_table": "dino.tarea_planificacion",
    "campos":"(codigo_sap, tipo, nombre)",
  "nro_campos": "($1, $2, $3)",
  "name_key": "(codigo_sap)"
},

{
  "rfc_table": "TI_T460A",
  "campos_rfc":"WERKS¬SOBSL¬LTEXT",
  "bd_table": "dino.taprovis_especial",
    "campos":"(codigo_centro, codigo_sap, nombre)",
  "nro_campos": "($1, $2, $3)",
  "name_key": "(codigo_centro, codigo_sap)"
},

{
  "rfc_table": "TI_T436A",
  "campos_rfc":"WERKS¬FHORI",
  "bd_table": "dino.tclave_horizonte",
  "campos":"(codigo_centro, codigo_sap)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap, codigo_centro)"
},

{
  "rfc_table": "TI_T024F",
  "campos_rfc":"WERKS¬FEVOR¬TXT",
  "bd_table": "dino.tresponsable_control_produccion",
    "campos":"(codigo_centro, codigo_sap, nombre)",
  "nro_campos": "($1, $2, $3)",
  "name_key": "(codigo_centro, codigo_sap)"
},

{
  "rfc_table": "TI_TCO43",
  "campos_rfc":"WERKS¬CO_PRODPRF¬PRODPRF_TX",
  "bd_table": "dino.tperfil_control_fabricacion",
  "campos":"(codigo_centro, codigo_sap)",
  "nro_campos": "($1, $2)",
  "name_key": "(codigo_sap, codigo_centro)"
}

];

//Funciones para limiar y registrar nuevos datos.
function insertar_datos(tabla, campos, nro_campos, name_key, datos) {
  let query = 'INSERT INTO '+tabla+campos+' VALUES'+nro_campos+' ON CONFLICT '+name_key+' DO NOTHING;';
  console.log(tabla);
  /*console.log(query);
  console.log(datos);*/

  return new Promise((resolve, reject) => {
      client.query(query, datos, (err, res) => {
          if (err) {
            console.log(err);
              reject(err);
          } else {
              resolve(true);
          }
      });
    });
}

//Seteo de los datos para llamar al servicio web del integrador
let servicio = fetch('https://integracion.cpsaa.com.pe/sap/maestros/maestros-materiales', {
            method: "get",
            headers: {
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImRhdGEiOnt9LCJwZXJtaXNvcyI6e30sInJvbGVzIjoiIiwiaWF0IjoxNjE0NDgwMjA1LCJleHAiOjE2NDYwMTYyMDUsImlzcyI6IkNlbWVudG9zIFBhY2FtYXlvIFMuQS5BLiJ9.CRVrR6DUoOu_rJuiy5PnfOj_rEuW1Gwtfdryqjlei8dcbya81LJXHWkWrdKJf4VYg_E4n2W7WUdfDOO6s86aUmPZANJArjZHm4qL0lcA1GHTn_4EE6D1swhLZw1l_zyuRXuaup-bncRbMHAq3X4ymzV1dz6mqEihpI7tAyP6f5WUiTcqz11lP9nrjHPhITUM_YTFD0ieTCLc0Evi2Yjjy3161wDKI_pzl2IIR_Wb_UeVTbYfK1DprwQW9dzjgmsvSX1nX910jHaew0sZQ7G6Dr-1pIay4WOa5PX0hQQWRvLNSN8mSHppq9ThW86h15Uq74XK4k8rdHGkWiwdZAsVn4ZM9U72iv7O2_mg9VoeGMu9Ct9XBPI__-Sd5YDT42a-E5xb5EhvZI7T_Bog8J9xCvrMkmZ4Mw09-q1XAMjXd9ol5fr36wRZAIYaAbXKo1LzLte20J5DDT9p94y3KNu6z4KS48_QHKi58paa0EonXwOeOW6KcllzlKJtJHssFipRANVWfXn3L_5GikvlAPnpXX2TX1xYVe3PLWPooDHyuOK8hOPBKg-IBnZjwLoIe3b9X23w9YnlBoESBi21oRz4yrTIEK3uu5JVwNpqjZz3NEuHiPlp9V3P88okw5xUjEtUx0rOiM-1gcMEGv8TiCSne1UJlyLVzcW9wucxo9cH1ws"
            }
        });

//Inicio de la operación
var promesas = [];
servicio.then(res => res.json())
.then(json => {   
    tablas.forEach(element => {//Recorres la constante
      //console.log(element.rfc_table);
      let tablas_rfc = json.resultado[element.rfc_table];
      tablas_rfc.forEach( element_rfc =>{//Recorres los resultado
        let campos_rfc = element.campos_rfc.split("¬");
        var datos= [];
        campos_rfc.forEach( camp_rfc =>{ //recorres los nombres de los campos SAP
          datos.push(element_rfc[camp_rfc]);
        });
 
        promesas.push(insertar_datos(element.bd_table, element.campos, element.nro_campos, element.name_key, datos));
      });
      if (element.rfc_table == 'TI_T001W') {
        setTimeout(function(){ console.log(Date.now()); }, 2000);
      }
    });
})
.then(() => {
  Promise.all(promesas)
  .then(() => {
    client.end();
  })
  .catch(err => {
    client.end();
    console.log(err);
  });
})
.catch(err => {
  //client.end();
  console.log(err);
});

