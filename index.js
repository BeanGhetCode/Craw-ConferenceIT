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



app.use('/', require('./routers/indexRouter'));
app.use('/user', require('./routers/userRouter'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
