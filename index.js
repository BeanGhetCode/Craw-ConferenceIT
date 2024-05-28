const express = require('express');
const expressHbs = require('express-handlebars');
const moment = require('moment'); // Import thư viện moment để tính toán thời gian
const app = express();
const { createPagination } = require('express-handlebars-paginate');

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

// Định nghĩa helper calculateDeadline
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
        ...helpers // Thêm helper calculateDeadline vào danh sách các helpers
    }
}));
app.set('view engine', 'hbs');

app.use('/', require('./routers/indexRouter'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
