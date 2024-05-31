const bcrypt = require('bcrypt');
const passport = require('passport');
const models = require('../models');
const { where } = require('sequelize');

const userController = {};
userController.User = async (req, res) => {
    try {
        // Lấy id người dùng từ session
        let id_user = req.session.user.id;

        // Tìm thông tin người dùng
        let user = await models.User.findOne({ where: { id: id_user } });

        // Kiểm tra xem người dùng có tồn tại không
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Lấy danh sách các hội nghị mà người dùng theo dõi
        let followLists = await models.FollowList.findAll({
            where: { id_user: id_user },
            include: [{ model: models.Conference, include: [{ model: models.Topic, attributes: ['name'] }] }]
        });
        
        // Kiểm tra nếu không có FollowList nào được tìm thấy
        if (!followLists || followLists.length === 0) {
            return res.status(404).send('User has no follow lists.');
        }
        console.log(followLists)
        res.locals.user = user;
        res.locals.followLists = followLists;
        res.render('user');
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).send('Internal Server Error');
    }
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
userController.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log(email)
        let user = await models.User.findOne({ where: { email: email } });
        if (!user) {
            return res.redirect('/?successLogin=false'); // Redirect with error message
        }
        // Compare the provided password with the hashed password in the database
        let passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.redirect('/?successLogin=false'); // Redirect with error message
        }
        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            isLoggedIn: true 
        };
        res.redirect('/?successLogin=true');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in'); // Handle errors
    }
};

  userController.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
  };


module.exports = userController;
