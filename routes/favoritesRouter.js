const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../model/favorites');

const favoritesRouter = express.Router()
favoritesRouter.use(bodyParser.json())

favoritesRouter.route('/')
    .options(cors.corsWithOpts, (req,res) => { res.sendStatus(200); })
    .get(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id}) //After dB connectivity we will return JSON data back to client (for GET req). 
        .populate('user')
        .populate('favDishes')
        .then((favs) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favs); //get all 
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        /**
         * Find the user
         * if that user has favorites document associated, push the dish(es) from the req.body
         * else create new favorites document using create()
         * 
         */
        Favorites.findOne({user: req.user._id})
        .then((fav) => {
            if(fav) {
                for (let body of req.body) {
                    if (fav.favDishes.indexOf(body._id) === -1) {
                        fav.favDishes.push(body._id);  // push the json objects from the body into the document
                    }
                }
                fav.save()
                .then((resp) => {
                    Favorites.findById(resp._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favs) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favs);
                    });
                }, (err) => next(err));
            }
            else {
                Favorites.create({'user': req.user._id, 'favDishes': req.body})
                fav.save()
                .then((resp) => {
                    Favorites.findById(resp._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favs) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favs);
                    });
                }, (err) => next(err))
            }
        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .put(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /favorites')   
    })
    .delete(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOneAndRemove({"user": req.user._id}) 
        .then((favs) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favs);
        }, (err) => next(err))
        .catch((err) => next(err));
    });

/**
 * 
 * Route /favorites/:dishId
 * 
 */

favoritesRouter.route('/:dishId')
    .options(cors.corsWithOpts, (req,res) => { res.sendStatus(200); })
    .get(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then((favs) => {
            if (!favs) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists:": false, "favorites": favs}); //If part of favorites exists will be true
            }
            else {
                if (favs.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists:": false, "favorites": favs}); //If part of favorites exists will be true
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists:": true, "favorites": favs});
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .post(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        /**
         * Find the user
         * if that user has favorites document associated, push the dish from the req.params
         * else create new favorites document using create()
         * 
         */
        Favorites.findOne({user: req.user._id})
        .populate('user')
        .populate('favDishes')
        .then((fav) => {
            if(fav) {
                if (fav.favDishes.indexOf(req.params.dishId) === -1) {
                    fav.favDishes.push(req.params.dishId)
                }
                fav.save()
                .then((resp) => {
                    Favorites.findById(resp._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favs) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favs);
                    })
                }, (err) => next(err));
            }
            else {
                Favorites.create({'user': req.user._id, 'favDishes': [req.params.dishId]})
                fav.save()
                .then((resp) => {
                    Favorites.findById(resp._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favs) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favs);
                    });
                }, (err)=> next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /favorites/' + req.params.dishId)   
    })
    .delete(cors.corsWithOpts, authenticate.verifyUser, (req,res,next) => {
        /**
         * Find the user
         * if that user has favorites document associated, 
         * select the index of the dish from the req.params and delete
         * else generate respective errors
         */
         Favorites.findOne({user: req.user._id})
         .then((fav) => {
             if (fav) {
                let idx = fav.favDishes.indexOf(req.params.dishId);
                if (idx >= 0){
                    fav.favDishes.splice(idx, 1);
                    fav.save()
                    .then((resp) => {
                        Favorites.findById(resp._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favs) => {
                            console.log('Removed from favorites:\n', resp)
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favs);
                        })
                    }, (err) => next(err));
                }
                else{
                    let err = new Error('Oops Sorry, Dish not found!');
                    err.status = 404;
                    return next(err);
                }
             }
             else {
                let err = new Error('Oops Sorry, Favorites not found!');
                err.status = 404;
                return next(err);
             }
         }, (err) => next(err))
         .catch((err) => next(err))
    })

module.exports = favoritesRouter;