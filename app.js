require("dotenv").config(); // load environment from .env file
require("./init");      // initial process

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const logger = require("./lib/logger");
const api = require("./routes/index");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger.logMiddleWare);

app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const port = process.env.PORT || 4000; // default port 4000

app.listen(port, () => {
  logger.info(
    `${process.env.name || "devApiServer"} is listening to port ${port}`
  );
});

module.exports = app;