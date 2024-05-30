const controller = {};
const models = require('../models'); 
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

controller.showHomepage = async (req, res) => {
    try {
        // Lấy tất cả các chủ đề
        let topics = await models.Topic.findAll();

        // Lấy các tham số từ req.query
        let topicId = req.query.topic;
        let keyword = req.query.keyword;

        // Tạo đối tượng queryOptions ban đầu với include các chủ đề
        let queryOptions = {
            include: {
                model: models.Topic,
                attributes: ['name']
            }
        };

        // Nếu có topicId, thêm điều kiện vào queryOptions
        if (topicId) {
            queryOptions.where = { topic_id: topicId };
        }

        // Nếu có keyword, thêm điều kiện vào queryOptions
        if (keyword) {
            queryOptions.where = {
                [Op.or]: [
                    {name: { [Op.like]: `%${keyword}%` } },
                ]
            };
        }

        // Thực hiện truy vấn để lấy danh sách hội nghị với các tùy chọn đã xác định
        let conferences = await models.Conference.findAll(queryOptions);

        // Truyền dữ liệu vào biến locals để sử dụng trong template
        res.locals.topics = topics;
        res.locals.conferences = conferences;

        // Render template 'index' với dữ liệu đã được truyền vào
        res.render('index');
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

        
controller.addToFollowList = async (req, res) => {
    try {
        let conferenceId = req.body.conference_id;
        let userId = req.body.user_id;
        console.log(userId)
        // Kiểm tra xem userId có tồn tại hay không
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Sử dụng userId và conferenceId để thêm vào danh sách theo dõi
        await models.FollowList.create({
            id_user: userId,
            id_conference: conferenceId
        });

        // Redirect hoặc thực hiện hành động tiếp theo
        res.redirect('/');
    } catch (error) {
        console.error('Error adding to follow list:', error);
        res.status(500).json({ success: false, message: 'An error occurred while adding to follow list' });
    }
};

module.exports = controller;
