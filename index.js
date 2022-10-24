const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");
const app = express();

app.use(express.urlencoded({ extended: "false" }));
app.use(express.json());

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("Database mySql is connected...");
});

app.use("/auth", require("./routes/auth"));

app.listen(process.env.PORT || 5000, () => {
  console.log("APp is running on port 5000... Ooooouuuuyeaaaaaah!");
});

//// for localhost ////
// const db = mysql.createConnection({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE,
// });