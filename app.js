// security
require('dotenv').config();

// Import required modules
const express = require('express')  // for building the web application
const https = require('node:https') // for making HTTP requests to the Mailchimp API
const bodyParser = require('body-parser') // for parsing request bodies

// Create an Express app
const app = express()

const port = process.env.PORT || 3003 // set the port number to listen on

// Define Mailchimp API details
const mailChimpApiKey = process.env.mailChimpApiKey
const mailChimpAudienceListID = process.env.mailChimpAudienceListID
const mailChimpURL = process.env.mailChimpURL

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"))

// Define a route to serve the signup form
app.get('/', (req, res) => {
  console.log(__dirname + "/signup.html")
  res.sendFile(__dirname + "/signup.html")
})

// Handle form submissions
app.post('/', (req, res) => {
  const firstName = req.body.firstName; // get the first name from the form data
  const lastName = req.body.lastName; // get the last name from the form data
  const emailAddress = req.body.emailAddress; // get the email address from the form data

  // Construct the data to send to the Mailchimp API
  var data = {
    members: [
      {
        email_address: emailAddress,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        }
      }
    ]
  }

  var jsonData = JSON.stringify(data) // convert the data to a JSON string

  const url = mailChimpURL + mailChimpAudienceListID // construct the URL for the Mailchimp API

  const options = {
    method: "POST",
    auth: "aobasar:" + mailChimpApiKey // set the API key for authentication
  }

  // Make an HTTP request to the Mailchimp API
  const request = https.request(url, options, function (response) {
    if (response.statusCode === 200) { // if the request is successful
      res.sendFile(__dirname + "/success.html"); // send the success page

      response.on("data", function (data) {
        console.log("The JSON data was sent perfectly") // log a message to the console
      })

    }
    else {
      res.sendFile(__dirname + "/failure.html"); // if the request fails, send the failure page
    }
  })

  request.write(jsonData) // write the JSON data to the request body
  request.end() // end the request

})

// Handle redirects to the home page
app.post('/failure', (req, res) => {
  res.redirect("/")
})

// When click the done link redirect to homepage
app.post('/done', (req, res) => {
  res.redirect("/")
})

// Ignore requests for the favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile("/dev/null")
})

// Start the Express app and listen for incoming requests
app.listen(port, () => {
  console.log("-----------------------------------------")
  console.log("Server listening on PORT", port);
  console.log("-----------------------------------------")
})
