const express = require('express');
const bodyParser = require('body-parser');
require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Leaders = require('../model/leaders');

const leaderRouter = express.Router()
leaderRouter.use(bodyParser.json())

leaderRouter.route('/')       //Mount in index.js 
.options(cors.corsWithOpts, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Leaders.find(req.query) //After dB connectivity we will return JSON data back to client (for GET req). 
    .then((ldrs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(ldrs); //get all 
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.create(req.body)
    .then((ldr) => {
        console.log('Leader Added', ldr);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(ldr); //post one
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /leaders')   
})
.delete(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.remove({}) //remove all
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

/*
-
-
- leaderId
-
-
*/

leaderRouter.route('/:leaderId')
.options(cors.corsWithOpts, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Leaders.findById(req.params.leaderId) //Check if dish exists, if yes
    .then((ldr) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(ldr);     //show the content
    }, (err) => next(err))  
    .catch((err) => next(err)); //catch if any error
})
.post(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403
    res.end('POST operation not supported on /leaders/'+ req.params.leaderId)  
})
.put(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body  //find the dish and update body
    }, {
        new: true,
        useFindAndModify: false
    })
    .then((ldr) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(ldr);
    }, (err) => next(err))  
    .catch((err) => next(err));
})
.delete(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))  
    .catch((err) => next(err));
});

module.exports = leaderRouter;