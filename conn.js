const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const port = 8000;

const app = express();

// created mysql connection
let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "otp_automation",
});

connection.connect(function (err) {
  if (err) {
    console.log("Cannot connect");
    console.log(err);
  } else {
    console.log("Database connected");
    connection.query(`SHOW TABLES`, function (err, result) {
      if (err) {
        console.log(`Error executing the query - $(err)`);
      } else {
        console.log("Result: ", result);
      }
    });
  }
});

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server running @ ${port}`);
});

app.post("/post", (req, res) => {
  let sender;
  let msg = req.body.message;
  var regex = /[.,:]/g;
  msg = msg.replace(regex, "");
  let msg_arr = msg.split(" ");
  console.log(msg_arr);
  let otp;

  msg_arr.forEach((element) => {
    let temp_var = element;
    if (element.length === 4 || element.length === 6) {
      // let num = element;
      if (!isNaN(element)) {
        if (!otp) {
          otp = temp_var;
        }
      }
    }
    if (element === "5Paisa") {
      sender = "FIVEPS";
    }
  });
  if (otp == null) {
    console.log("NO OTP FOUND");
    return res.json({ message: "No otp found..." });
  } else {
    console.log("THE OTP IS: ", otp);
  }

  if (sender == null) {
    sender = "OTHERS";
  }

  let mobile = req.body.number; //hc
  console.log("OTP here: ", otp);
  console.log("Mobile number here: ", mobile);
  connection.query(
    `INSERT INTO MESSAGE (sender, message_time, message, otp, user_mobile) VALUES ('${sender}', NOW(), '${msg}', '${otp}', '${mobile}');`,
    function (err, result) {
      if (err) {
        console.log(`Error executing the query - ${err}`);
      } else {
        console.log("Result: ", result);
        return res.json({ message: "SMS stored successfully!!!" });
      }
    }
  );
});

app.get("/alldata", (req, res) => {
  connection.query(`SELECT * FROM MESSAGE;`, function (err, result) {
    if (err) {
      console.log(`Error executing the query - ${err}`);
    } else {
      console.log("Result: ", result);
      res.send(JSON.stringify(result));
      // res.send("Data retrieved successfully!!!");
      // res.json({res: result});
    }
  });
});

app.get("/lastdata", (req, res) => {
  connection.query(
    `select * from message ORDER BY id DESC LIMIT 1;`,
    function (err, result) {
      if (err) {
        console.log(`Error executing the query - ${err}`);
      } else {
        result[0].message_time = convert_time_to_ist(result);
        console.log("Result: ", result);
        res.send(JSON.stringify(result));
        // res.send("Data retrieved successfully!!!");
        // res.json({res: result});
      }
    }
  );
});

function convert_time_to_ist(result) {
  let dateTime = result[0].message_time;

  // to utc number
  var dateUTC = new Date(dateTime);
  var dateUTC = dateUTC.getTime();

  // to ist object
  var dateIST = new Date(dateUTC);
  dateIST.setHours(dateIST.getHours() + 5);
  dateIST.setMinutes(dateIST.getMinutes() + 30);
  return dateIST;
}
