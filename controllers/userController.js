const bcrypt = require('bcrypt');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const models = require('../models');
const { where } = require('sequelize');

const userController = {};

userController.User = async (req, res) => {
    let user = await models.User.findOne({where:{id:id}})
    res.local.user = user
};

userController.registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await models.User.create({ fullname, email, password: hashedPassword });
        console.log(fullname, email, password)
        res.redirect('/?successCreateUser=true');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, message: 'An error occurred while registering the user' });
    }
};
userController.loginUser = (req,res)=>{
    passport.authenticate('local-login', (error, user)=>{
        if (error){
            return next(error)
        }
        if(!user){
            return res.redirect('/')
        }
        req.loginUser(user, (error)=>{
            if(error) {return res.redirect('/user')}
        })

    })
}

module.exports = userController;
