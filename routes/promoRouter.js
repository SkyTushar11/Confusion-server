const express = require('express');
const bodyParser = require('body-parser');
require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promotions = require('../model/promotions');

const promoRouter = express.Router()
promoRouter.use(bodyParser.json())

promoRouter.route('/')       //Mount in index.js
.options(cors.corsWithOpts, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.find(req.query) //After dB connectivity we will return JSON data back to client (for GET req). 
    .then((promos) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promos); //get all 
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promotions.create(req.body)
    .then((promo) => {
        console.log('Promotion Added', promo);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo); //post one
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /promotions')   
})
.delete(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promotions.remove({}) //remove all
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
- promoId
-
-
*/
promoRouter.route('/:promoId')
.options(cors.corsWithOpts, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.findById(req.params.promoId) //Check if dish exists, if yes
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);     //show the content
    }, (err) => next(err))  
    .catch((err) => next(err)); //catch if any error
})
.post(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403
    res.end('POST operation not supported on /promotions/'+ req.params.promoId)  
})
.put(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body  //find the dish and update body
    }, {
        new: true,
        useFindAndModify: false
    })
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))  
    .catch((err) => next(err));
})
.delete(cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))  
    .catch((err) => next(err));
});

module.exports = promoRouter;