const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");

const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: "false" }));

dotenv.config({ path: "./.env" });

app.use(
  session({
    key: "userid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 60 * 60 * 24, // may be changed
    },
  })
);

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("Database mySql is connected...");
});

app.use("/auth", require("./routes/auth"));

app.listen(process.env.PORT || 5000, () => {
  console.log("APp is running on port 5000... Ooooouuuuyeaaaaaah!");
});

//// for remote hosting ////
// const db = mysql.createConnection({
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
// });
