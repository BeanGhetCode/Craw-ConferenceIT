const express = require('express');
const expressHbs = require('express-handlebars');
const moment = require('moment'); // Import thư viện moment để tính toán thời gian
const bodyParser = require('body-parser'); // Import body-parser
const session = require('express-session'); // Import express-session
const app = express();
const { createPagination } = require('express-handlebars-paginate');
const passport = require('./controllers/passport');
const flash = require('connect-flash');

const port = process.env.PORT || 3000;


const helpers = {
    calculateDeadline: function(start_date) {
        const now = moment();
        const start = moment(start_date);
        const deadline = start.diff(now, 'days');
        return deadline;
    },
    formatDateTime: function(dateTime) {
        return moment(dateTime).format('YYYY-MM-DD');
    }
};

const setLocals = (req, res, next) => {
    // Kiểm tra xem session đã được thiết lập chưa và có chứa thông tin người dùng không
    if (req.session && req.session.user) {
        
        // Nếu có, thiết lập các biến cục bộ với các giá trị từ session
        res.locals.isLoggedIn = true;
        res.locals.userId = req.session.user.id;
        res.locals.fullname = req.session.user.fullname;
    } else {
        // Nếu không, thiết lập các biến cục bộ với giá trị mặc định
        res.locals.isLoggedIn = false;
        res.locals.userId = null;
        res.locals.fullname = null;
    }
    next();
};


app.engine('hbs', expressHbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        createPagination,
        ...helpers
    }
}));
app.set('view engine', 'hbs');

// Sử dụng body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình session middleware
app.use(session({   
    secret: '090899', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));
app.use (passport.initialize());
app.use (passport.session());
app.use(flash());

app.use(setLocals);
app.use('/user', require('./routers/userRouter'));
app.use('/', require('./routers/indexRouter'));


app.listen(port, () => console.log(`Example app listening on port ${port}!`));