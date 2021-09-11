// Access the workerData by requiring it.
const { parentPort, workerData } = require('worker_threads');

// Thanks to:
// http://fightingforalostcause.net/misc/2006/compare-email-regex.php
// http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
// http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
// https://en.wikipedia.org/wiki/Email_address  The format of an email address is local-part@domain, where the 
// local part may be up to 64 octets long and the domain may have a maximum of 255 octets.[4]

const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function isEmailValid(email) {
    if (!email) return false;

    var emailParts = email.split('@');

    if(emailParts.length !== 2) return false

    var account = emailParts[0];
    var address = emailParts[1];

    if(account.length > 64) return false

    else if(address.length > 255) return false

    var domainParts = address.split('.');
    if (domainParts.some(function (part) {
        return part.length > 63;
    })) return false;


    if (!emailRegex.test(email)) return false;

    return true;
}

function confirmEnding(string, target) {
    return string.substr(-target.length) === target;
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", (param) => {
    console.log("Entro al worker thread!!");
    console.log("param: "+param);
    let result;
    if (typeof param !== "string") {
        throw new Error("El usuario debe ser un texto.");
    }
    if(confirmEnding(param,"@gmail.com") 
    || confirmEnding(param,"@dino.com.pe") //6012
    || confirmEnding(param,"@cpsaa.com.pe") //2020
    || confirmEnding(param,"@dinoselva.com.pe") //6052
    || confirmEnding(param,"@cssa.com.pe") //2015
    || confirmEnding(param,"@fospac.cpsaa.com.pe") //1030
    ){
        result = isEmailValid(param);
    } else {
        result = false;
    }
    
    console.log("¿es email válido? : "+result);
    console.log("Fin worker thread!!");
    // return the result to main thread.
    parentPort.postMessage(result);
});