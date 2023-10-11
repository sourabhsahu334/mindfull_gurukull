const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const Allnews = require('./Modal');
const Singletypenews = require('./Singlemodal');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const app = express();
// const axios = require("axios");

const port = process.env.PORT || 3000;
app.use(express.json());
require("./db");
require('dotenv').config();
app.get("/",async(req,res)=>{
  res.json({success:true})
})
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Replace with the path to your service account key JSON file

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://stocks-e2878-default-rtdb.firebaseio.com/', // Replace with your Firebase database URL
};

admin.initializeApp(firebaseConfig);

const database = admin.database();
const ref = database.ref('YourKhabri');
const ref2 = database.ref('YourKhabrisingle');

const array = [ "economy","stocks","mutual-funds","personal-finance","ipo","startups","equity-research","commodity","currency","health-and-fitness","trends","politics"];
const array2=["health-and-fitness","trends","politics"]
const rates = [ "real-estate-property","gold-rates-today","silver-rates-today"];
const htmltags= [ "science","education","technical-analysis"];
// Define an API route to trigger notifications
app.post('/send-notification', async(req, res) => {
  const db = admin.database();
  let array = []
const ref = db.ref('devicesid/'); // Replace with the actual path in your database

await ref.once('value', (snapshot) => {
  const data = snapshot.val();
  console.log('Data read from the database:', data);
     array= Object.entries(data)
})
.catch((error) => {
  console.error('Error reading data:', error);
});
   

     for ( const item of array){
      console.log(item[1])
      const message = {
        data: {
          title:"Daily News Updates",
          body:"News Have Updates Check Now",
        },
        token: item[1],
      };
    
   try {
   await admin.messaging().send(message);
   console.log("send")
   } catch (error) {
    console.log(error);
   }
     }
 res.json({
  success:true
 })
     
  });
  


async function fetchbydignlelink(link) {
  try {
   
    // Fetch the HTML content of the website
    const response = await axios.get(link);

    // Log the entire response

    const html = response.data;
     let obj = {};
    // Load the HTML content into Cheerio
    const $ = cheerio.load(html);
    const title= $(".article_title").text();
    const heading=$(".article_desc").text();
    const content = $(".content_wrapper p ").text();
    const image =$(".article_image img").attr("src");
    obj = {
      title,
      heading,
      content,
      image:image?image:"empty"
    }
    return obj ;
  } catch (error) {
    console.error('Error:', error);
  }
}

app.get("/getdata",async(req,res)=>{
  try {
    const data = await Allnews.find();
    const data2= await Singletypenews.find();
    res.json({data:data,success:true,data2:data2});
  } catch (error) {
    res.json({
      error:error
    })
  }
});


app.get("/getalldata",async(req,res)=>{
 
try {
  const firebasedataarray = [];
  const firebasesignlenewsarray=[];
      // await Allnews.deleteMany();
      // await Singletypenews.deleteMany();
      const finalarray = []
     for ( const newstype of array){
      const url = array2.includes(newstype)?`https://www.moneycontrol.com/news/${newstype}`:`https://www.moneycontrol.com/news/business/${newstype}`; // Replace with the URL you want to scrape
      // const url = `https://www.moneycontrol.com/news/business/economy`;
      // Fetch the HTML content of the website
      const response = await axios.get(url);
  
      // Log the entire response
  
      const html = response.data;
  
      // Load the HTML content into Cheerio
      const $ = cheerio.load(html);
      
      // Use Cheerio selectors to extract data
      const title = $('title').text();

       const scrapedData = [];
       const tem=[]
    // Assuming the list items are inside a parent element with the ID 'category'
    $('ul#cagetory li').each((index, element) => {
      const heading = $(element).find('h2 a').text().trim();
      const time = $(element).find('span').text().trim();
      const paragraph = $(element).find('p').text().trim();
      const image = $(element).find('img').attr("data");
      const nextlink= $(element).find("a").attr("href")
     if( heading){
      scrapedData.push({
        heading,
        paragraph,
        image,
        nextlink,
        time
      });
      
      
     }
     
    });
     for (const item of scrapedData){
  
      const data = await fetchbydignlelink(item.nextlink);;
      const uniqueId = uuidv4();
      const singlenews= {
        data:data,
        newstype:newstype,
        id:uniqueId
      }
      firebasesignlenewsarray.push(singlenews)
      tem.push({
        item,
        id:uniqueId

      })
     }
     const obj = {
      data:tem,
      newstype:newstype
     }
     firebasedataarray.push(obj); 
    //  await Allnews.create({
    //   data:tem,
    //   newstype:newstype
    // })
    }
    for ( const newstype of htmltags){
      const url = `https://www.moneycontrol.com/news/tags/${newstype}.html`; // Replace with the URL you want to scrape
      // const url = `https://www.moneycontrol.com/news/business/economy`;
      // Fetch the HTML content of the website
      const response = await axios.get(url);
  
      // Log the entire response
  
      const html = response.data;
  
      // Load the HTML content into Cheerio
      const $ = cheerio.load(html);
      
      // Use Cheerio selectors to extract data
      const title = $('title').text();

       const scrapedData = [];
       const tem=[]
    // Assuming the list items are inside a parent element with the ID 'category'
    $('ul#cagetory li').each((index, element) => {
      const heading = $(element).find('h2 a').text().trim();
      const time = $(element).find('span').text().trim();
      const paragraph = $(element).find('p').text().trim();
      const image = $(element).find('img').attr("data");
      const nextlink= $(element).find("a").attr("href")
     if( heading){
      scrapedData.push({
        heading,
        paragraph,
        image,
        nextlink,
        time
      });
      
      
     }
     
    });
     for (const item of scrapedData){
  
      const data = await fetchbydignlelink(item.nextlink);
      const uniqueId = uuidv4();

      const singlenews= {
        id:uniqueId,
        data:data,
        newstype:newstype
      }
      firebasesignlenewsarray.push(singlenews)
      tem.push({
        item,
        id:uniqueId
      })
     }
     const obj = {
      data:tem,
      newstype:newstype
     }
     firebasedataarray.push(obj); 
    }
    for ( const newstype of rates){
      const url = `https://www.moneycontrol.com/news/${newstype}`; // Replace with the URL you want to scrape
      // const url = `https://www.moneycontrol.com/news/business/economy`;
      // Fetch the HTML content of the website
      const response = await axios.get(url);
  
      // Log the entire response
  
      const html = response.data;
  
      // Load the HTML content into Cheerio
      const $ = cheerio.load(response.data);

      // Find the table with class "InIndianCitiesTable"
      const table = $('.InIndianCitiesTable table');

      // Create an array to store the extracted data
      const goldData = [];

      // Iterate through the table rows
      $('tbody tr', table).each((index, row) => {
        const columns = $(row).find('td');

        // Extract data from columns
        const city = $(columns[0]).text().trim();
        const standardGoldRate1Gram = $(columns[1]).text().trim();
        const standardGoldRate8Grams = $(columns[2]).text().trim();
        const pureGoldRate1Gram = $(columns[3]).text().trim();
        const pureGoldRate8Grams = $(columns[4]).text().trim();

        // Create an object to store the data
        const cityData = {
          city,
          standardGoldRate1Gram,
          standardGoldRate8Grams,
          pureGoldRate1Gram,
          pureGoldRate8Grams,
        };
        // Add the object to the array
        goldData.push(cityData);
      });
      const obj = {
        data:goldData,
        newstype:newstype
       }
       firebasedataarray.push(obj); 

    }
    console.log(firebasedataarray);
    ref.set(firebasedataarray)
  .then(() => {
    console.log('Array stored successfully in Firebase Realtime Database');
  })
  .catch((error) => {
    console.error('Error storing array:', error);
  });
  ref2.set(firebasesignlenewsarray)
  .then(() => {
    console.log('Array stored successfully in Firebase Realtime Database');
  })
  .catch((error) => {
    console.error('Error storing array:', error);
  });
  res.json({success:true})
  
} catch (error) {
  console.log(error);
  res.json({error:error})
}
})

app.post('/data', async (req, res) => {
  const {newstype}=req.body;
    try {
       const data = await Allnews.find({
        newstype:newstype
       })
  
      res.json({ success:true,data });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while scraping the website.' });
    }
  });


  app.post('/getsinglenewsdata', async (req, res) => {
    const {newsid}=req.body;
  
      try {
        const data= await Singletypenews.findOne({_id:newsid})
        res.json({ success:true,data:data});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while scraping the website.' });
      }
    });




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
