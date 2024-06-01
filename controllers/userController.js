const bcrypt = require('bcrypt');
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
        let options = {
            include: [
                {
                    model: models.Conference,
                    include: {
                        model: models.Topic
                    }
                }
            ],
            where: {
                id_user: id_user
            }
        };
        
        
        let followLists = await models.FollowList.findAll(options);
        
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
userController.addToFollowList = async (req, res) => {
    try {
        let id_conference = req.body.conference_id;
        let userId = req.session.user.id; // Lấy userId từ session
        console.log(id_conference,userId)
        // Kiểm tra xem userId có tồn tại hay không
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Sử dụng userId và conferenceId để thêm vào danh sách theo dõi
        await models.FollowList.create({
            id_conference: id_conference,
            id_user: userId
        });

        // Redirect hoặc thực hiện hành động tiếp theo
        res.redirect('/?addToFollowList=true');
    } catch (error) {
        console.error('Error adding to follow list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while adding to follow list' });
    }
};

userController.deleteToFollowList = async (req, res) => {
    try {
        let id_conference = req.body.conference_id;
        let id_user = req.session.user.id; // Lấy userId từ session
        console.log(id_conference,id_user )
        // Kiểm tra xem userId có tồn tại hay không
        if (!id_user) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        // Xóa khỏi danh sách theo dõi
        await models.FollowList.destroy({
            where: {
                id: id_conference,
                id_user: id_user
            }
        });
        // Redirect về trang người dùng với thông báo thành công
        res.redirect('/user?deleteToFollowList=true');
    } catch (error) {
        console.error('Error deleting from follow list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting from follow list' });
    }
};

module.exports = userController;
