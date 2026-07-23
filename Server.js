require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

const PORT = process.env.PORT || 9000;
const SECRET_KEY = process.env.JWT_SECRET;

const DB_FILE = path.join(__dirname, "json-api", "db.json");


app.use(cors());
app.use(express.json());


// ================= DATABASE =================

function readDB() {
    return JSON.parse(
        fs.readFileSync(DB_FILE, "utf8")
    );
}


function writeDB(data) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );
}


// ================= JWT =================

function verifyJWT(req,res,next){

    const header = req.headers.authorization;

    if(!header || !header.startsWith("Bearer ")){
        return res.status(401).json({
            message:"Token missing"
        });
    }


    const token = header.split(" ")[1];


    try{

        const decoded = jwt.verify(
            token,
            SECRET_KEY
        );

        req.user = decoded;

        next();

    }catch(error){

        res.status(403).json({
            message:"Invalid token"
        });

    }

}



// ================= HOME =================

app.get("/",(req,res)=>{

    res.json({
        message:"Ahmed Zahran API Running"
    });

});



// ================= LOGIN =================

app.post("/login",(req,res)=>{


    const {
        email,
        password
    } = req.body;


    const db = readDB();



    const admin = db.admins.find(
        user => user.email === email
    );



    if(!admin){

        return res.status(401).json({
            message:"Invalid Email or Password."
        });

    }



    const passwordMatch =
        bcrypt.compareSync(
            password,
            admin.password
        );



    if(!passwordMatch){

        return res.status(401).json({
            message:"Invalid Email or Password."
        });

    }



    const user = {

        id:admin.id,
        name:admin.name,
        email:admin.email,
        role:"admin"

    };



    const token = jwt.sign(
        user,
        SECRET_KEY,
        {
            expiresIn:"2h"
        }
    );



    res.json({

        message:"Login successful",
        token,
        user

    });


});



// ================= PRODUCTS =================


// GET ALL

app.get("/products",(req,res)=>{

    const db = readDB();

    res.json(db.products);

});



// GET ONE

app.get("/products/:id",(req,res)=>{

    const db = readDB();


    const product =
        db.products.find(
            p => String(p.id) === req.params.id
        );


    if(!product){

        return res.status(404).json({
            message:"Product not found"
        });

    }


    res.json(product);

});



// CREATE

app.post("/products",verifyJWT,(req,res)=>{


    const db = readDB();


    const product={

        id:String(Date.now()),

        title:req.body.title,

        price:Number(req.body.price),

        description:req.body.description,

        image:req.body.image,

        category:req.body.category

    };



    db.products.push(product);


    writeDB(db);



    res.status(201).json({

        message:"Product added",

        product

    });


});



// UPDATE

app.put("/products/:id",verifyJWT,(req,res)=>{


    const db = readDB();


    const index =
        db.products.findIndex(
            p=>String(p.id)===req.params.id
        );



    if(index===-1){

        return res.status(404).json({
            message:"Product not found"
        });

    }



    db.products[index]={

        ...db.products[index],

        title:req.body.title,

        price:Number(req.body.price),

        description:req.body.description,

        image:req.body.image,

        category:req.body.category

    };



    writeDB(db);



    res.json({

        message:"Updated",

        product:db.products[index]

    });


});



// DELETE

app.delete("/products/:id",verifyJWT,(req,res)=>{


    const db = readDB();


    db.products =
        db.products.filter(
            p=>String(p.id)!==req.params.id
        );


    writeDB(db);



    res.json({

        message:"Deleted"

    });


});



// ================= START =================


app.listen(PORT,()=>{

    console.log("==============================");
    console.log("🚀 Server Running");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("==============================");

});