const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

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

      // const hashedPass = await bcrypt.hash(password, 18);
      let hashedPass;
      try {
        hashedPass = await bcrypt.hash(password, 18);
      } catch (err) {
        console.log(err);
      }

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
              message: "Successfully registered, login now",
            });
          }
        }
      );
    }
  );
};

exports.loginGet = async (req, res) => {
  if (req.session.user)
    res.send({
      successful: true,
    });
  else
    res.send({
      successful: false,
    });
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
        const passwordSame = results[0]?.password && bcrypt.compare(password, results[0].password);

        if (!results || !passwordSame)
          return res.send({
            successful: false,
            message: "Email or Password is incorrect",
          });
        else {
          const id = results[0]?.email;
          const Token = JWT.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24,
          });
          req.session.user = results[0]?.email;

          res.send({
            auth: true,
            token: Token,
            email: results[0]?.email,
            message: "Successfully logged in",
          });
          // res.status(200).send({
          //   successful: true,
          // });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.handleUserAuth = (req, res) => {
  res.send({ auth: true, message: "you are authenticated" });
};

exports.verifyJWT = (req, res, next) => {
  const Token = req.headers["x-access-token"];

  if (!Token)
    return res.send({
      auth: false,
      message: "failed to authenticate, no token received",
    });
  else {
    JWT.verify(Token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res.send({
          auth: false,
          message: "failed to authorize",
        });
      else {
        res.userId = decoded.id;
        next();
      }
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.send({
    message: "successfully logged out",
  });
};
