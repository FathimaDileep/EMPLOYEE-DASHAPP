
const express = require('express')
const mysql = require("mysql");
const cors = require("cors");

const bcrypt = require('bcrypt'); 
var jwt = require('jsonwebtoken');

const app = express()
const PORT = 3001

app.use(express.json());
app.use(cors());

const con = mysql.createConnection({
    user : "root",
    host : "localhost",
    password : "",
    database : "nodejsdb"
})

con.connect(function(err) {
if(err)  {
    console.log("Error in connection");
} else {
    console.log("Connected!")
}
})

app.get('/getEmployee', (req,res)=>{
    const sql = "SELECT * FROM employee";
    con.query(sql, (err,result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.get('/get/:id', (req,res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?";
    con.query(sql, [id] ,(err,result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({Status: "Success", Result: result})
})
})

app.put("/update/:id", (req,res) => {
    const userId = req.params.id;
    const q = "UPDATE employee SET `name`=?, `email`=?, `position`=?, `salary`=? WHERE id = ?";

    const values = [
     req.body.name,
     req.body.email,
     req.body.position,
     req.body.salary,
    ];

    con.query(q, [...values,userId], (err,data) => {
        if(err) return res.send(err);
        return res.json(data);
    });
});


app.delete('/delete/:id', (req,res) => {
    const id = req.params.id;
    const sql = "DELETE FROM employee where id = ?";
    con.query(sql, [id] ,(err,result) => {
        if(err) return res.json({Error: "delete employee error in sql"});
        return res.json({Status: "Success"})
   })
})

app.get('/adminCount', (req, res) => {
    const sql = "Select count(id) as admin from users";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Error in running query"});
        return res.json(result);
    })
})

app.get('/employeeCount', (req,res) => {
    const sql = "Select count(id) as employee from employee";
    con.query(sql,(err,result) => {
        if(err) return res.json({Error: "Error in running query"});
        return res.json(result);
  })
})

app.get('/salary', (req,res) => {
    const sql = "Select sum(salary) as sumOfSalary from employee";
    con.query(sql,(err,result) => {
        if(err) return res.json({Error: "Error in running query"});
        return res.json(result);
  })
})

app.post('/create',(req,res) => {
     const name = req.body.name;
     const email = req.body.email;
     const position = req.body.position;
     const salary = req.body.salary;

con.query("INSERT INTO employee (name, email, position, salary) VALUES (? ? ? ? )",[name, email, position, salary],
    (_err , result) => {
        if(result){
            res.send(result);
        }  else {
            res.send({message: "ENTER CORRECT DETAILS!"})
        }
    }
)
})

app.get('/hash',(req,res)=>{
    bcrypt.hash("123456", 10, (err,hash)=> {
        if(err) return res.json({Error:"Error in hashing passsword"});
        const values = [
            hash
        ]
        return res.json({result: hash});
    })
})

app.post('/login',(req,res)=>{
    const sql = "SELECT * FROM users Where email =?";
    con.query(sql,[req.body.email],(err,result)=>{
    if(err) return res.json({Status: "Error" , Error: "Error in running query"});
      if(result.length>0) {
        bcrypt.compare(req.body.password.toString(), result[0].password, (err,response)=>{
            if(err) return res.json({Error:"Password Error"});
            if (response) {
            const token = jwt.sign({role: "admin"}, "jwt-secret-key", {expiresIn: '1d'});
            return res.json({Status:"Success" , Token : token});
         }  else {
            return res.json({Status: "Error", Error: "Wrong Email or Password"});
         }    
    })
        } else {
          return res.json({Status: "Error", Error: "Wrong Email or Password"});
        }
    })
 })

 app.post('/register',(req,res)=>{
 const sql = "INSERT INTO users(`name`,`email`,`password`) VALUES(?)";
 bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
    if(err) return res.json({Error: "Error in hashing password"});
     const values = [
        req.body.name,
        req.body.email,
        hash,
     ]
     con.query(sql, [values], (err,result) => {
        if(err) return res.json({Error: "Error query"});
        return res.json({Status : "Success"});
     })
  })
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})

