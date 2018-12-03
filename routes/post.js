const Joi = require('joi');
const postModel = require("../models/post");

exports.templateRender = async (req,res) => {
    await res.render('index', {
        title: 'Hello Express!',
    });
};

exports.stringRender = async (req,res) => {
    res.send('express string');
};

exports.jsonRender = async (req,res) => {
    const schema = Joi.object().keys({
            username: Joi.string().alphanum().min(4).max(15).required(),
            email: Joi.string().email().required(),
            password: Joi.string().required().min(6)
        });

    const result = Joi.validate(req.query, schema);
    if(result.error) {
        res.statusCode = 400; // Bad request
        return res.send();
    }
    res.json({
        title: 'express json'
    });
};
exports.dbConnect = async (req,res) => {
    let result;
    try{
        result =  await postModel.getPosts()
    }catch(e){
        res.statusCode = 401; // Bad request
        return res.send();
    }

    res.json(result);
};