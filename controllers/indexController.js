const controller = {};
const models = require('../models'); 
const { Sequelize } = require('sequelize');

controller.showHomepage = async (req, res) => {
    let conferences = await models.Conference.findAll({
        include: {
            model: models.Topic, 
            attributes: ['name'], 
        }
    });
    
    res.locals.conferences = conferences;
    res.render('index');
};

module.exports = controller;
