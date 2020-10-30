//Load required modules
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
const categories = require('./formJS');  

//COnfigure port and environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000; 
const API_KEY = process.env.API_KEY || "";

//Instantiate express and configure handlebars 
const app = express();
app.engine('hbs',handlebars({defaultLayout:'default.hbs'}));
app.set('view engine','hbs');

//Configure the API
const ENDPOINT = 'https://newsapi.org/v2/top-headlines'
const searchUrl = (query,country,category) => withQuery(ENDPOINT, {
    //apiKey: API_KEY,
    q: query,
    country, //country == 'sg', 'bg', etc. 
    category, //category == 'business', 'entertainment', etc. 
    
})

const headers = {
    'X-Api-Key': API_KEY
}

//Configure routes

//static route
app.use(express.static(__dirname + '/static'));

//Get routes
app.get('/',(req,res) => {

    res.status(200);
    res.format({
        'text/html': () => {res.render('searchPage',{categories})}
    })
})

app.get('/search', async(req,res) => {

    try{
        
        const {query,country,categories} = req.query;
        const result = await fetch(searchUrl(query,country,categories), {headers});
        console.log(searchUrl(query,country,categories));
        const resultJSON = await result.json();
        const articles = [];
        resultJSON.articles.map(article => { articles.push({ title:article['title'], imageUrl:article['urlToImage'], description: article['description'], publishDate: article['publishedAt'], newsUrl: article['url']}) })
        res.status(200);
        res.type('text/html');
        const hasContent = !!articles.length
        res.render('resultsPage',{articles, hasContent});

    }catch{
        res.status(404);
        res.send('You shit Error 404');
        console.error("Error 404");
    }
})


//Start server 

if(!API_KEY){
    console.error("Please enter a valid API_KEY");
}else{
    app.listen(PORT, () => {console.info(`Your app has started on port ${PORT} at ${new Date()}`)});
}