'use strict';

/*
 * nodejs-express-mongoose
 * Copyright(c) 2015 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser')
const Promise = require("bluebird");


const config = require('./config');
const userModel = require("./app/models/user");
const productModel = require("./app/models/product");
const relationModel = require("./app/models/relation");
const profitModel = require("./app/models/profit");

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
const connection = connect();

/**
 * Expose
 */

module.exports = {
    app,
    connection
};

// Bootstrap models
fs.readdirSync(models)
    .filter(file => ~file.indexOf('.js'))
    .forEach(file => require(join(models, file)));

// Bootstrap routes
//require('./config/passport')(passport);
//require('./config/express')(app, passport);
//require('./config/routes')(app, passport);

connection
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

function listen() {
    if (app.get('env') === 'test') return;
    app.listen(port);
    console.log('Express app started on port ' + port);

    // initialize db
}

function connect() {
    var options = {
        keepAlive: 1,
        useNewUrlParser: true
    };
    mongoose.connect(config.db, options);
    return mongoose.connection;
}


app.get("/user", (req, res) => {
    
    console.log(userModel.find({}, (err, users) => {
        //console.log(users);

        res.send(users);
    }));
})

app.post('/user', function (req, res) {
    var userId = req.body.user_id;
    var userName = req.body.name;
    var userLevel = req.body.vip_level;

    var newUser = new userModel({
        user_id:    userId,
        name:       userName,
        vip_level:  userLevel
    })

    newUser.save((err) => {
        if(err) {
            console.log(err);
            res.status(200).send("bad request");
        }

    })

    res.status(200).send(newUser);
})

app.post("/buy", function(req, res) {
    let amount = req.body.amount;
    let interest = 0;
    let productLevel = 0; 
    let period = req.body.period;
    
    if(amount >= 1000 && amount < 5000) {
        interest = amount * 0.2 / period;
        productLevel = 1;
    } else if(amount >= 5000 && amount < 10000) {
        interest = amount * 0.3 / period;
        productLevel = 2;
    } else if(amount >= 10000 && amount < 30000) {
        interest = amount * 0.4 / period;
        productLevel = 3;
    } else if(amount >= 30000 && amount < 50000) {
        interest = amount * 0.5 / period;
        productLevel = 4;
    } else if(amount >= 50000) {
        interest = amount * 0.6 / period;
        productLevel = 5;
    } else {
        res.send("bad request");
    }

    var newProduct = new productModel({
        user_id: req.body.user_id,
        product_level: productLevel,
        amount: req.body.amount,
        period: period,
        order_date: new Date(),
        start_date: new Date(),
        end_date: new Date(),
        static_interest_daily: interest
    })

    newProduct.save((err) => {
        if(err) {
            console.log(err);
            res.send("bad request");
        }

        userModel.findOne({ user_id: req.body.user_id }, (err, user) => {
            if(err) {
                console.log(err);
                res.send("bad request");
            }

            var curAmount = 0;

            if(typeof(user.product_total_amount) === "undefined") {
                curAmount = amount;
            } else {
                curAmount = user.product_total_amount + amount;
            }

            var curLevel = user.vip_level;

            if(curAmount >= 1000 && curAmount < 5000) {
                curLevel = 1;
            } else if(amount >= 5000 && amount < 10000) {
                curLevel = 2;
            } else if(amount >= 10000 && amount < 30000) {
                curLevel = 3;
            } else if(amount >= 30000 && amount < 50000) {
                curLevel = 4;
            } else if(amount >= 50000) {
                curLevel = 5;
            }

            userModel.findOneAndUpdate({ user_id: req.body.user_id }, { product_total_amount:  curAmount, vip_level: curLevel }, (err) => {
                if(err) {
                    console.log(err);
                    res.send("bad request");
                } else {
                    res.send("buy product successfully");
                }
            })
        })
    })
})

app.post("/relate", function(req, res) {

    let userId = req.body.user_id;
    let invitorId = req.body.invitor_id;

    //console.log(req.body);

    return Promise.resolve(userModel.findOne({ user_id: userId }).exec())
    .then((user) => {
        if(user == null) {
            res.send("bad request");
        }
        
        // get invitor path
        if(typeof(invitorId) === "undefined" || invitorId === null || invitorId === ""){
            invitorId = "";
            return "";
        } else {
            return Promise.resolve(relationModel.findOne({ user_id: invitorId }).exec())
            .then((invitor) => {
                return invitor.path;
            })
        }
    })
    .then((invitorPath) => {
        let userPath = invitorPath + "/" + userId;

        let newRelation = new relationModel({
            user_id:    userId,
            invitor_id:    invitorId,
            path:       userPath
        })

        newRelation.save((err) => {
            if(err) {
                console.log(err);

                res.send("bad request");
            }

            res.send(newRelation);
        })
    })
})

app.post("/profit", (req, res) => {
    let user = req.body.user_id;

    return generatetionUserProfitAsync(user)
    .then(() => {
        res.send();
    })
})

function parentAddProfitAsync(staticSum, parentId, level) {

    let profitPercents = [0.5, 0.3, 0.1, 0.05, 0.01, 0.01, 0.01, 0.01, 0.01];
    return Promise.resolve(relationModel.count({ invitor_id: parentId }).exec())
    .then(count => {
        if(count >= level) {
            let options = { upsert: true, new: true, setDefaultsOnInsert: true };
            
            // Find the document
            return Promise.resolve(profitModel.findOneAndUpdate({ user_id: parentId }, { user_id: parentId, "$inc": { generate_profit: staticSum * profitPercents[level - 1] } }, options).exec()); 
        } else {
            return;
        }
    })
}


function generatetionUserProfitAsync(userId) {

    let staticSum = 0 
    return Promise.resolve(productModel.find({ user_id: userId }).exec())
    .then((products) => {

        if(products.length > 0) {
            for(let i = 0; i < products.length; i++) {
                staticSum += products[i].static_interest_daily;
            }
        }

        return relationModel.findOne({ user_id: userId })
    })
    .then((userRelation) => {
    
        let path = userRelation.path;
        let nodes = path.split("/");

        let promArr = [];
        let counter = 0;
        for(let i = nodes.length - 2; i > 0; i--) {
            promArr.push(parentAddProfitAsync(staticSum, nodes[i], counter + 1))
            counter ++;
            if(counter === 0) break;
        }

        return Promise.all(promArr);
    })
    .then(() => {
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        // Find the document
        return Promise.resolve(profitModel.findOneAndUpdate({ user_id: userId }, { user_id: userId, "$inc": { static_profit: staticSum } }, options).exec());
    })
    .then(() => {
        return;
    })
}

