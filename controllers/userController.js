const bcrypt = require('bcrypt');
const models = require('../models');

const userController = {};

userController.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await models.User.create({ name, email, password: hashedPassword });
        res.redirect('/?successCreateUser=true');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, message: 'An error occurred while registering the user' });
    }
};

userController.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await models.User.findOne({ where: { email: email } });
        console.log(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const fullname = user.fullname; // Đảm bảo rằng trường fullname tồn tại trong mô hình User của bạn
        const id = user.id;
        res.redirect(`/?successLogin=true&fullname=${encodeURIComponent(fullname)}`);

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'An error occurred while logging in' });
    }
};

module.exports = userController;
