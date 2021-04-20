const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const objectId = require('mongodb').ObjectID;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9grss.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(express.static('reviews'));
app.use(fileUpload());
const port =5000;

app.get('/',(req,res) =>{
    res.send("hello form db")
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("solar-solution").collection("services");
  const bookingCollection = client.db("solar-solution").collection("bookings"); 
 const reviewsCollection = client.db("solar-solution").collection("reviews"); 
  const adminCollection= client.db("solar-solution").collection("admin");
 app.get('/services', (req, res) => {
    servicesCollection.find()
      .toArray((err, items) => {
        res.send(items)
        
      })
  })
  


  app.get('/reviews', (req, res) => {
    reviewsCollection.find()
      .toArray((err, items) => {
        res.send(items)
        
      })
  })

  

  app.get('/manageService', (req, res) => {
    servicesCollection.find()
      .toArray((err, items) => {
        res.send(items)
        
      })
  })

  app.delete('/deleteProduct/:id',(req, res) =>{
    
    const id = objectId(req.params.id);
    console.log(id)
    servicesCollection.findOneAndDelete({_id:id})
    .then(result => {
      res.send(!!result.deletedCount >0)
      
    })
  })
 
  app.post('/addService', (req,res) =>{
      const file = req.files.file;
      const serviceTitle = req.body.serviceTitle;
      const cost = req.body.cost;
      const description= req.body.description;
      const filePath = `${__dirname}/services/${file.name}`;
      file.mv(filePath, err =>{
          if(err){
              console.log(err);
               res.status(500).send({msg:"Failed to upload Image"});

          }
          const newImg = fs.readFileSync(filePath);
          const encImg = newImg.toString('base64');

          var image = {
              contentType: req.files.file.mimetype,
              size: req.files.file.size,
              img: Buffer(encImg, 'base64')
          };
          servicesCollection.insertOne({serviceTitle, cost,description,image})
          .then(result => {
              fs.remove(filePath,error =>{
                  if(error) {
                      console.log(error);
                      res.status(500).send({msg:"Failed to upload Image"})}
                      res.send(result.insertedCount > 0)
                })
              
            })
        })
    });

    app.post('/addReview', (req,res) =>{
      const file = req.files.file;
      const name = req.body.name;
      const company= req.body.company;
      const description= req.body.description;
      const filePath = `${__dirname}/reviews/${file.name}`;
      file.mv(filePath, err =>{
          if (err){
              console.log(err);
              res.status(500).send({msg:"Failed to upload Image"});
          }
          const newImg = fs.readFileSync(filePath);
          const encImg = newImg.toString('base64');
  
          var image = {
              contentType: req.files.file.mimetype,
              size: req.files.file.size,
              img: Buffer(encImg, 'base64')
          };
          reviewsCollection.insertOne({name, company,description,image})
            .then(result => {
                fs.remove(filePath,error =>{
                    if(error) {
                        console.log(error);
                        res.status(500).send({msg:"Failed to upload Image"})}
                        res.send(result.insertedCount > 0)
                  })
                
              })
      })
  });


    app.post('/booking', (req, res) =>{
        const newBooking = req.body;
        bookingCollection.insertOne(newBooking)
        .then(result => {
          res.send(result.insertedCount > 0);
        })
        console.log(newBooking);
      })

    app.get('/order',(req,res) =>{
      bookingCollection.find({email:req.query.email})
      .toArray((err, documents) =>{
        res.send(documents)
      })
    })

    app.get('/allOrder',(req,res) =>{
      bookingCollection.find()
      .toArray((err, documents) =>{
        res.send(documents)
      })
    })

    app.post('/addAdmin', (req,res) => {
      const email = req.body.email;
      adminCollection.insertOne({email})
      .then(result => {
          res.send(result.insertedCount >0)
      })

    })
    app.post('/isAdmin', (req,res) =>{
      const email =req.body.email;
      adminCollection.find({email: email})
      .toArray((err, admin) =>{
        res.send(admin.length >0);
      })
    })

});



app.listen(process.env.PORT || port)