var express = require('express');
var bodyParser = require('body-parser');
var User = require('../model/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');  

var userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.options('*', cors.corsWithOpts, (req, res) => { res.statusCode = 200});

userRouter.get('/', cors.corsWithOpts, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content_type', 'application/json');
    res.json(users); 
  }, (err) => next(err))
  .catch((err) => next(err));
});

userRouter.post('/signup', cors.corsWithOpts, (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, 
  (err, user) => { 
    if (err) {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json({err: err});
    }
    else { 
      if (req.body.firstname) {
        user.firstname = req.body.firstname
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({err: err});
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json')
          res.json({success: true, status: "Registration Successful!"});
        });
      });
    }
  });
});

userRouter.post('/login', cors.corsWithOpts, //error will be handled by authenticate function
  (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
      if(err) {
        return next(err);
      }
      if (!user) {
        res.statusCode = 401;
        res.setHeader('Content-type', 'application/json')
        res.json({
          success: false,
          status: "Log-in Unsuccessful!"});
      }
      req.logIn(user, (err) => {
        if(err) {
          res.statusCode = 401;
          res.setHeader('Content-type', 'application/json')
          res.json({
            success: false, 
            status: "Login unsuccessful!",
            err: "Coundn't Login user."});
        }

        var token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json')
        res.json({
          success: true, 
          token: token,
          status: "You are successfully logged-in!"
        });

      })
    }) (req, res, next);
});

userRouter.get('/logout', (req, res) => {
  if (res.json({success: true})) {
    res.redirect('/');
  }
  else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
})

userRouter.get('/facebook/token', passport.authenticate('facebook-token'), 
(req, res) => {
    if(req.user) {
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
    res.setHeader('Content-type', 'application/json')
    res.json({
      success: true, 
      token: token,
      status: "You are successfully logged-in!"});
    }
})

//To check if JWT is valid or not
userRouter.get('/checkJWT', cors.corsWithOpts, (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if(err) {
      return next(err);
    }

    if(!user){
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT invalid!!',
        success: false,
        err: info
      });
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'JWT valid!!',
        success: true,
        user: user
      });
    }
  });
})

module.exports = userRouter;
