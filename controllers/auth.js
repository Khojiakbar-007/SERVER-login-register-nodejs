const mysql = require("mysql");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) console.log(err);

      // inputs' validation
      if (results?.length > 0)
        return res.send({
          successful: false,
          message: "That email has already been taken.",
        });
      else if (!email || !name || !password)
        return res.send({
          successful: false,
          message: "Please, enter all inputs",
        });
      // email validation
      else if (!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
        return res.send({
          successful: false,
          message: "Please, enter valid email",
        });

      const hashedPass = await bcrypt.hash(password, 18);

      db.query(
        "INSERT INTO users SET ?",
        {
          name,
          email,
          password: hashedPass,
        },
        (err, results) => {
          if (err) console.log("ERROR: ", err);
          else {
            console.log(results);
            return res.send({
              successful: true,
              message: "Successfully registered!",
            });
          }
        }
      );
    }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return res.send({
        successful: false,
        message: "Please, provide both email and password",
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        console.log(results);
        if (!results || !bcrypt.compare(password, await results[0]?.password))
          return res.send({
            successful: false,
            message: "Email or Password is incorrect",
          });
        else {
          const id = results[0]?.id;
          res.status(200).send({
            successful: true,
            message: "Successfully logged in",
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};
