const controller = {};
const models = require('../models'); 
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');


controller.showHomepage = async (req, res) => {
    try {
        // Lấy tất cả các chủ đề
        let topics = await models.Topic.findAll();
        let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page));
        const limit = 20;
        
        // Lấy trạng thái đăng nhập từ res.locals
        let isLoggedIn = res.locals.isLoggedIn;
        console.log(isLoggedIn);
        
        // Lấy các tham số từ req.query
        let topicId = req.query.topic;
        let keyword = req.query.keyword;
        let sortParam = req.query.sort;

        // Tạo đối tượng queryOptions ban đầu với include các chủ đề
        let queryOptions = {
            include: {
                model: models.Topic,
                attributes: ['name'],
            }
        };

        // Xử lý sắp xếp dựa trên tham số sort
        if (sortParam) {
            switch (sortParam) {
                case 'nameAsc':
                    queryOptions.order = [['name', 'ASC']];
                    break;
                case 'nameDesc':
                    queryOptions.order = [['name', 'DESC']];
                    break;
                case 'dateAsc':
                    queryOptions.order = [['start_date', 'ASC']];
                    break;
                case 'dateDesc':
                    queryOptions.order = [['start_date', 'DESC']];
                    break;
                case 'locationAsc':
                    queryOptions.order = [['location', 'ASC']];
                    break;
                case 'locationDesc':
                    queryOptions.order = [['location', 'DESC']];
                    break;
                case 'topicAsc':
                    queryOptions.order = [['topic_id', 'ASC']];
                    break;
                case 'topicDesc':
                    queryOptions.order = [['topic_id', 'DESC']];
                    break;
                case 'deadlineAsc':
                    queryOptions.order = [['start_date', 'ASC']];
                    break;
                case 'deadlineDesc':
                    queryOptions.order = [['start_date', 'DESC']];
                default:
                    break;
            }
        }
        // Thêm điều kiện vào queryOptions nếu có topicId
        if (topicId) {
            queryOptions.where = { topic_id: topicId };
        }

        // Thêm điều kiện vào queryOptions nếu có keyword
        if (keyword) {
            queryOptions.where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${keyword}%` } },
                ]
            };
        }

        // Thiết lập limit và offset cho queryOptions
        queryOptions.limit = limit;
        queryOptions.offset = limit * (page - 1);

        // Thực hiện truy vấn để lấy danh sách hội nghị với các tùy chọn đã xác định
        let { rows, count } = await models.Conference.findAndCountAll(queryOptions);
        
        // Thiết lập thông tin phân trang
        res.locals.pagination = {
            page: page,
            limit: limit,
            totalRow: count,
            queryParams: req.query
        };

        // Thiết lập trạng thái đăng nhập trong biến locals
        res.locals.isLoggedIn = isLoggedIn;

        // Truyền dữ liệu vào biến locals để sử dụng trong template
        res.locals.topics = topics;
        res.locals.conferences = rows;
        
        // Render template 'index' với dữ liệu đã được truyền vào
        res.locals.isLoggedIn = isLoggedIn
        res.render('index');
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
};

controller.addToFollowList = async (req, res) => {
    try {
        let id_conference = req.body.conference_id;
        let userId = req.session.user.id; // Lấy userId từ session
        console.log(id_conference, userId);
        
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

module.exports = controller;
