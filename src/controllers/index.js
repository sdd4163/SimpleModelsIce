var path = require('path'); //path is a built-in node library to handle file system paths
var models = require('../models'); //pull in our models. This will automatically load the index.js from that folder

//get the Cat and Dog models
var Cat = models.Cat.CatModel;
var Dog = models.Dog.DogModel;


//default fake data so that we have something to work with until we make a real Cat
var defaultData = {
    name: "unknown", 
    bedsOwned: 0
};
var defaultDogData = {
    name: "unknown", 
    breed: "mutt",
	age: "0"
};

//object for us to keep track of the last Cat we made and dynamically update it sometimes
var lastAdded = new Cat(defaultData);
var lastAddedDog = new Dog(defaultDogData);

//function to handle requests to the main page
//controller functions in Express receive the full HTTP request 
//and a pre-filled out response object to send
var hostIndex = function(req, res){
    //res.render takes a name of a page to render. These must be in the folder you specified as views in your main app.js file
    //Additionally, you don't need .jade because you registered the file type in the app.js as jade. Calling res.render('index')
    //actually calls index.jade. A second parameter of JSON can be passed into the jade to be used as variables with #{varName}
    res.render('index',{
        currentName: lastAdded.name,
        title: "Home",
        pageName: "Home Page"
    });
};

//function to find all cats on request. Express functions always receive the request and the response.
var readAllCats = function(req, res, callback) {
    //Call the model's built in find function and provide it a callback to run when the query is complete
    //Find has several versions
    //one parameter is just the callback
    //two parameters is JSON of search criteria and callback. That limits your search to only things that match the criteria
    //The find function returns an array of matching objects
    Cat.find(callback);
};

//function to find a specific cat on request. Express functions always receive the request and the response.
var readCat = function(req, res) {

    //function to call when we get objects back from the database.
    //With Mongoose's find functions, you will get an err and doc(s) back
    var callback = function(err, doc) {
        if(err) {
            return res.json({err:err}); //if error, return it
        }
        
        //return success
        return res.json(doc);
    };

    //Call the static function attached to CatModels. This was defined in the Schema in the Model file. 
    //This is a custom static function added to the CatModel
    //Behind the scenes this runs the findOne method. You can find the findByName function in the model file.
    Cat.findByName(name1, callback);
};

//function to handle requests to the page1 page
//controller functions in Express receive the full HTTP request 
//and a pre-filled out response object to send
var hostPage1 = function(req, res) {
    
    //function to call when we get objects back from the database.
    //With Mongoose's find functions, you will get an err and doc(s) back
    var callback = function(err, docs) {
        if(err) {
            return res.json({err:err}); //if error, return it 
        }

        //return success
        return res.render('page1', {cats:docs}); 
    };
    
    readAllCats(req, res, callback);
};

//function to handle requests to the page2 page
//controller functions in Express receive the full HTTP request 
//and a pre-filled out response object to send
var hostPage2 = function(req, res) {
    //res.render takes a name of a page to render. These must be in the folder you specified as views in your main app.js file
    //Additionally, you don't need .jade because you registered the file type in the app.js as jade. Calling res.render('index')
    //actually calls index.jade. A second parameter of JSON can be passed into the jade to be used as variables with #{varName}
    res.render('page2');
};

//function to handle requests to the page3 page
//controller functions in Express receive the full HTTP request 
//and a pre-filled out response object to send
var hostPage3 = function(req, res) {
    //res.render takes a name of a page to render. These must be in the folder you specified as views in your main app.js file
    //Additionally, you don't need .jade because you registered the file type in the app.js as jade. Calling res.render('index')
    //actually calls index.jade. A second parameter of JSON can be passed into the jade to be used as variables with #{varName}
    res.render('page3');
};

//function to handle get request to send the name
//controller functions in Express receive the full HTTP request 
//and a pre-filled out response object to send
var getName = function(req, res) {
    //res.json returns json to the page. Since this sends back the data through HTTP
    //you can't send any more data to this user until the next response
    res.json({name: lastAdded.name});
};

//function to handle a request to set the name
//controller functions in Express receive the full HTTP request
//and get a pre-filled out response object to send
//ADDITIONALLY, with body-parser we will get the body/form/POST data in the request as req.body
var setName = function(req, res) {
    
    //check if the required fields exist
    //normally you would also perform validation to know if the data they sent you was real 
    if(!req.body.firstname || !req.body.lastname || !req.body.beds) {
        //if not respond with a 400 error (either through json or a web page depending on the client dev)
        return res.status(400).json({error: "firstname,lastname and beds are all required"});
    }
    
    //if required fields are good, then set name
    var name = req.body.firstname + " " + req.body.lastname;
    
        //dummy JSON to insert into database
    var catData = {
        name: name,
        bedsOwned: req.body.beds
    };

    //create a new object of CatModel with the object to save
    var newCat = new Cat(catData);
    
    //Save the newCat object to the database
    newCat.save(function(err) {
        if(err) {
            return res.json({err:err}); //if error, return it
        }
        
        //set the lastAdded cat to our newest cat object. This way we can update it dynamically
        lastAdded = newCat;
        
        //return success
        return res.json({name: name});
    });
};

var setDogName = function(req, res) {
    
    //check if the required fields exist
    //normally you would also perform validation to know if the data they sent you was real 
    if(!req.body.name || !req.body.breed || !req.body.age) {
        //if not respond with a 400 error (either through json or a web page depending on the client dev)
        return res.status(400).json({error: "Name, breed, and age are all required!"});
    }
    
    //if required fields are good, then set name
    var name = req.body.name
    
    //dummy JSON to insert into database
    var dogData = {
        name: name,
        breed: req.body.breed,
		age: req.body.age
    };

    //create a new object of DogModel with the object to save
    var newDog = new Dog(dogData);
    
    //Save the newDog object to the database
    newDog.save(function(err) {
        if(err) {
            return res.json({err:err}); //if error, return it
        }
        
        //set the lastAdded dog to our newest dog object. This way we can update it dynamically
        lastAddedDog = newDog;
        
        //return success
        return res.json({name: name});
    });
};

//function to handle requests search for a name and return the object
//controller functions in Express receive the full HTTP request 
//and a pre-filled out response object to send
var searchName = function(req,res) {

    //check if there is a query parameter for name
    //BUT WAIT!!?!
    //Why is this req.query and not req.body like the others
    //This is a GET request. Those come as query parameters in the URL
    //For POST requests like the other ones in here, those come in a request body because they aren't a query
    //POSTS send data to add while GETS query for a page or data (such as a search)
    if(!req.query.name) {
        return res.json({error: "Name is required to perform a search"});
    }
  
    //Call our Cat's static findByName function. Since this is a static function, we can just call it without an object
    //Methods like sayName are attached only to each object instance (not static) 
    //pass in a callback (like we specified in the Cat model
    //Normally would you break this code up, but I'm trying to keep it together so it's easier to see how the system works
    //For that reason, I gave it an anonymous callback instead of a named function you'd have to go find
    Cat.findByName(req.query.name, function(err, doc) {
        //errs, handle them
        if(err) {
            return res.json({err:err}); //if error, return it            
        }
        
        //if no matches, let them know (does not necessarily have to be an error since technically it worked correctly)
        if(!doc) {
            return res.json({error: "No cats found"});
        }
        
        //if a match, send the match back
        return res.json({name: doc.name, beds: doc.bedsOwned});
    });
  
};

var searchDogName = function(req,res) {

    //check if there is a query parameter for name
    //BUT WAIT!!?!
    //Why is this req.query and not req.body like the others
    //This is a GET request. Those come as query parameters in the URL
    //For POST requests like the other ones in here, those come in a request body because they aren't a query
    //POSTS send data to add while GETS query for a page or data (such as a search)
    if(!req.query.name) {
        return res.json({error: "Name is required to perform a search"});
    }
  
    //Call our Dog's static findByName function. Since this is a static function, we can just call it without an object
    //Methods like sayName are attached only to each object instance (not static) 
    //pass in a callback (like we specified in the Cat model
    //Normally would you break this code up, but I'm trying to keep it together so it's easier to see how the system works
    //For that reason, I gave it an anonymous callback instead of a named function you'd have to go find
    Dog.findByName(req.query.name, function(err, doc) {
        //errs, handle them
        if(err) {
            return res.json({err:err}); //if error, return it            
        }
        
        //if no matches, let them know (does not necessarily have to be an error since technically it worked correctly)
        if(!doc) {
            return res.json({error: "No dog found"});
        }
		
		doc.age++;
        
        //if a match, send the match back
        return res.json({name: doc.name, breed: doc.breed, age: doc.age});
    });
  
};

//function to handle a request to update the last added object
//this PURELY exists to show you how to update a model object
//Normally for an update, you'd get data from the client, search for an object, update the object and put it back
//We will skip straight to updating an object (that we stored as last added) and putting it back
var updateLast = function(req, res) {
    
    //Your model is JSON, so just change a value in it. This is the benefit of ORM (mongoose) and/or object documents (Mongo NoSQL)
    //You can treat objects just like that - objects. 
    //Normally you'd find a specific object, but we will only give the user the ability to update our last object
    lastAdded.bedsOwned++;
    
    //once you change all the object properties you want, then just call the Model object's save function
    lastAdded.save(function(err) {
        //if save error, just return an error for now
        if(err) {
            return res.json({err:err});
        }
        
        //otherwise just send back the name as a success
        return res.json({name:lastAdded.name, beds: lastAdded.bedsOwned});
    });
};

//function to handle a request to any non-real resources (404)
//controller functions in Express receive the full HTTP request
//and get a pre-filled out response object to send
var notFound = function(req, res) {
    //res.render takes a name of a page to render. These must be in the folder you specified as views in your main app.js file
    //Additionally, you don't need .jade because you registered the file type in the app.js as jade. Calling res.render('index')
    //actually calls index.jade. A second parameter of JSON can be passed into the jade to be used as variables with #{varName}
    res.status(404).render('notFound',{
        page: req.url
    });
};

//export the relevant public controller functions
module.exports = {
    index: hostIndex,
    page1: hostPage1,
    page2: hostPage2,
    page3: hostPage3, 
    getName: getName,
    setName: setName,
	setDogName: setDogName,
    updateLast: updateLast,
    searchName: searchName,
	searchDogName: searchDogName,
    notFound: notFound
};