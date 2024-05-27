const express = require('express')
const expressHbs = require('express-handlebars')
const app = express()
const {createPagination} = require('express-handlebars-paginate')

const port =  process.env.PORT || 3000

app.use(express.static(__dirname + "/public"))

app.engine('hbs', expressHbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs',
    runtimeOptions:{
        allowProtoPropertiesByDefault: true
    },helpers:{
        createPagination
        }
    },
));
app.set('view engine', 'hbs');

app.get('/sync', (req, res) => {
    let models = require('./models');
    models.sequelize.sync().then (() => {
        res.send('sync completed!');
    })

})

app.use('/', require("./routers/indexRouter"))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))