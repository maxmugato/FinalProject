// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');




// Get the functions in the db.js file to use
const db = require('./services/db');
app.use(express.urlencoded({ extended: true }));


const { Student } = require("./models/student");
const { User } = require("./models/user");

// Sample array of review objects (for demonstration)
let reviewsData = [
    { author: 'John', content: 'Great service!', date: '2022-01-01' },
    { author: 'Alice', content: 'Excellent experience!', date: '2022-01-15' }
  ];
  
  // Route to display reviews
  app.get("/reviews", function(req, res) {
    res.render("reviews", { reviews: reviewsData });
  });
  
  // Route to handle form submission for adding a new review
  app.post("/submit-review", function(req, res) {
    const { name, rating, message } = req.body;
    
    // Create a new review object
    const newReview = {
      author: name,
      content: message,
      date: new Date().toLocaleDateString()  // Example date formatting (adjust as needed)
    };
  
    // Push the new review to the reviewsData array
    reviewsData.push(newReview);
  
    // Redirect back to the reviews page
    res.redirect("/reviews");
  });
  


// Create a route for root - /
app.get("/", function(req, res) {
    res.render("login");
});


// Set the sessions
var session = require('express-session');
app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


// Task 1 JSON formatted listing of students
app.get("/all-students", function(req, res) {
    var sql = 'select * from Students';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });

});

// Task 2 display a formatted list of students
app.get("/all-students-formatted", function(req, res) {
    var sql = 'select * from Students';
    db.query(sql).then(results => {
    	    // Send the results rows to the all-students template
    	    // The rows will be in a variable called data
        res.render('all-students', {data: results});
    });
});

// Single student page.  Show the students name, course and modules
app.get("/student-single/:id", async function (req, res) {
    var stId = req.params.id;
    // Create a student class with the ID passed
    var student = new Student(stId);
    await student.getStudentName();
    await student.getStudentProgramme();
    await student.getStudentModules();
    console.log(student);
    res.render('student', {student:student});
});



// JSON output of all programmes
app.get("/all-programmes", function(req, res) {
    var sql = 'select * from Programmes';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });

});

// Single programme page (no formatting or template)
app.get("/programme-single/:id", async function (req, res) {
    var pCode = req.params.id;
    var pSql = "SELECT * FROM Programmes WHERE id = ?";
    var results = await db.query(pSql, [pCode]);
    //Now call the database for the modules
    //Why do you think that the word modules is coming in before the name of the programme??
    var modSql = "SELECT * FROM Programme_Modules pm \
    JOIN Modules m on m.code = pm.module \
    WHERE programme = ?";
    var modResults = await db.query(modSql, [pCode]);
    // String the results together, just for now.  Later we will push this
    // through the template
    res.send(JSON.stringify(results) + JSON.stringify(modResults));  
});


// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    var sql = 'select * from test_table';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results)
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});



// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

app.post('/add-note', async function (req, res) {
    params = req.body;
    // Adding a try/catch block which will be useful later when we add to the database
    var student = new Student(params.id);
    try {
         await student.addStudentNote(params.note);
         res.send('form submitted');
        }
     catch (err) {
         console.error(`Error while adding note `, err.message);
     }
     // Just a little output for now
     res.send('form submitted');

});


app.post('/redirect', (req, res) => {
  const { countryInput } = req.body;

  // Normalize input to lowercase
  const normalizedInput = countryInput.toLowerCase();

  console.log('Received country input:', normalizedInput);

  // Handle redirection based on normalizedInput
  switch (normalizedInput) {
    case 'russia':
    case 'россия':
      console.log('Redirecting to /about_russian.pug');
      res.redirect('/about_russian.pug');
      break;
    case 'united kingdom':
    case 'england':
    case 'англия':
    case 'великобритания':
      console.log('Redirecting to /about.pug');
      res.redirect('/about.pug');
      break;
    default:
      console.log('Redirecting to default /about.pug');
      res.redirect('/about.pug');
      break;
  }
});




  app.get('/default_page', (req, res) => {
    res.render('about'); // Assuming 'default_page.pug' is a valid template
  });
  

  // Register
app.get('/register', function (req, res) {
    res.render('register');
});


app.post('/set-password', async function (req, res) {
  params = req.body;
  var user = new User(params.email);
  try {
      uId = await user.getIdFromEmail();
      if (uId) {
          // If a valid, existing user is found, set the password and respond with a success message
          await user.setUserPassword(params.password);
          console.log(req.session.id);
          res.send('Username created. <a href="/login">Go back to login page</a>');
      } else {
          // Handle case where user is not found
          res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error:', error); // Log the specific error
      res.status(500).send('An error occurred: ' + error.message); // Send the error message to the client
    }
    
});



// Create a route for root - /
app.get("/", function(req, res) {
    console.log(req.session);
    if (req.session.uid) {
		res.send('Welcome back, ' + req.session.uid + '!');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

// Login
app.get('/login', function (req, res) {
    res.render('login');
});


// Check submitted email and password pair
app.post('/authenticate', async function (req, res) {
    params = req.body;
    var user = new User(params.email);
    console.log(user)
    try {
        uId = await user.getIdFromEmail();
        console.log(uId)
        if (uId) {
            match = await user.authenticate(params.password);
            if (match) {
                req.session.uid = uId;
                req.session.loggedIn = true;
                console.log(req.session.id);
                res.redirect('/index/');
            }
            else {
                // TODO improve the user journey here
                res.send('invalid password');
            }
        }
        else {
            res.send('invalid email');
        }
    } catch (err) {
        console.error(`Error while comparing `, err.message);
    }
});  

// Logout
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
  });

app.get('/about', (req, res) => {
    res.render('about'); 
  });
  
  app.get('/calendar', (req, res) => {
    res.render('calendar'); 
  });

  app.get('/CalendarRus', (req, res) => {
    res.render('CalendarRus'); 
  });

  app.get('/ContactRussian', (req, res) => {
    res.render('ContactRussian'); 
  });

  app.get('/LoginRus', (req, res) => {
    res.render('LoginRus'); 
  });

app.get('/Contact', (req, res) => {
    res.render('Contact'); 
  });

app.get('/reviews', (req, res) => {
    res.render('reviews'); 
  });

app.get('/index', (req, res) => {
    res.render('index'); 
  });

app.get('/RussianReviews', (req, res) => {
    res.render('RussianReviews'); 
  });

app.get('/about_russian', (req, res) => {
    res.render('about_russian');
  });


// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});
