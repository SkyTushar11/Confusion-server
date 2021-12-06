const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'https://Sky-OnyxBlack:3000'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if(whitelist.indexOf( req.header('Origin') ) !== -1) {  
        //to check if present or not, index === -1: absent ; index >= 0: present
        corsOptions= { origin: true };
    }
    else {
        corsOptions = { origin: false}
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOpts = cors(corsOptionsDelegate);