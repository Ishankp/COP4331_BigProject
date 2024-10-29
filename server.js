
const MongoClient = require('mongodb').MongoClient;

// Correctly URL-encoded password
const url = 'mongodb+srv://root:COP4331_RootP%40ssword@cluster0.wckml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });


var cardList =
[
	'Roy Campanella',
	'Paul Molitor',
	'Tony Gwynn',
	'Dennis Eckersley',
	'Reggie Jackson',
	'Gaylord Perry',
	'Buck Leonard',
	'Rollie Fingers',
	'Charlie Gehringer',
	'Wade Boggs',
	'Carl Hubbell',
	'Dave Winfield',
	'Jackie Robinson',
	'Ken Griffey, Jr.',
	'Al Simmons',
	'Chuck Klein',
	'Mel Ott',
	'Mark McGwire',
	'Nolan Ryan',
	'Ralph Kiner',
	'Yogi Berra',
	'Goose Goslin',
	'Greg Maddux',
	'Frankie Frisch',
	'Ernie Banks',
	'Ozzie Smith',
	'Hank Greenberg',
	'Kirby Puckett',
	'Bob Feller',
	'Dizzy Dean',
	'Joe Jackson',
	'Sam Crawford',
	'Barry Bonds',
	'Duke Snider',
	'George Sisler',
	'Ed Walsh',
	'Tom Seaver',
	'Willie Stargell',
	'Bob Gibson',
	'Brooks Robinson',
	'Steve Carlton',
	'Joe Medwick',
	'Nap Lajoie',
	'Cal Ripken, Jr.',
	'Mike Schmidt',
	'Eddie Murray',
	'Tris Speaker',
	'Al Kaline',
	'Sandy Koufax',
	'Willie Keeler',
	'Pete Rose',
	'Robin Roberts',
	'Eddie Collins',
	'Lefty Gomez',
	'Lefty Grove',
	'Carl Yastrzemski',
	'Frank Robinson',
	'Juan Marichal',
	'Warren Spahn',
	'Pie Traynor',
	'Roberto Clemente',
	'Harmon Killebrew',
	'Satchel Paige',
	'Eddie Plank',
	'Josh Gibson',
	'Oscar Charleston',
	'Mickey Mantle',
	'Cool Papa Bell',
	'Johnny Bench',
	'Mickey Cochrane',
	'Jimmie Foxx',
	'Jim Palmer',
	'Cy Young',
	'Eddie Mathews',
	'Honus Wagner',
	'Paul Waner',
	'Grover Alexander',
	'Rod Carew',
	'Joe DiMaggio',
	'Joe Morgan',
	'Stan Musial',
	'Bill Terry',
	'Rogers Hornsby',
	'Lou Brock',
	'Ted Williams',
	'Bill Dickey',
	'Christy Mathewson',
	'Willie McCovey',
	'Lou Gehrig',
	'George Brett',
	'Hank Aaron',
	'Harry Heilmann',
	'Walter Johnson',
	'Roger Clemens',
	'Ty Cobb',
	'Whitey Ford',
	'Willie Mays',
	'Rickey Henderson',
	'Babe Ruth'
];

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) =>
{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
	'GET, POST, PATCH, DELETE, OPTIONS'
	);
	next();
});

//	AddCard API
app.post('/api/addcard', async (req, res, next) =>
{
// incoming: userId, color
// outgoing: error
const { userId, card } = req.body;
const newCard = {Card:card,UserId:userId};
var error = '';
try
{
const db = client.db('SchedulePlanner');
const result = db.collection('Cards').insertOne(newCard);
}
catch(e)
{
error = e.toString();
}
cardList.push( card );
var ret = { error: error };
res.status(200).json(ret);
});

//	Login API
app.post('/api/login', async (req, res, next) =>
{
// incoming: login, password
// outgoing: id, firstName, lastName, error
var error = '';
const { login, password } = req.body;
const db = client.db('SchedulePlanner');
const results = await
db.collection('Users').find({Login:login,Password:password}).toArray();
var id = -1;
var fn = '';
var ln = '';
if( results.length > 0 )
{
id = results[0].UserId;
fn = results[0].FirstName;
ln = results[0].LastName;
}
var ret = { id:id, firstName:fn, lastName:ln, error:''};
res.status(200).json(ret);
});

//	SearchCards API
app.post('/api/searchcards', async (req, res, next) => {
  // incoming: userId, search
  // outgoing: results[], error
  var error = '';
  const { userId, search } = req.body;
  var _search = search.trim();
  try {
      const db = client.db('SchedulePlanner');
      const results = await db.collection('Cards').find({ "Card": { $regex: new RegExp(_search + '.*', 'i') } }).toArray();
      var _ret = results.map(result => result.Card); // Simplified mapping
      res.status(200).json({ results: _ret, error: error });
  } catch (e) {
      error = e.toString();
      console.error('Error searching cards:', error);
      res.status(500).json({ results: [], error });
  }
});

//	Register API
const { ObjectId } = require('mongodb');  // Ensure ObjectId is imported


app.post('/api/register', async (req, res) => {
	const { FirstName, LastName, Login, Password, email, ShareKey } = req.body;
	let error = '';
	let success = false;
  
	try {
	  const db = client.db('SchedulePlanner');
  
	  // Check if the user already exists by email
	  const existingUser = await db.collection('Users').findOne({ email });
	  if (existingUser) {
		return res.status(400).json({ success, error: 'User already exists' });
	  }
  
	  // Get the next incremental UserID
	  const latestUser = await db.collection('Users').find().sort({ UserID: -1 }).limit(1).toArray();
	  const UserID = latestUser.length > 0 ? latestUser[0].UserID + 1 : 1;
  
	  // Create a new user
	  const newUser = {
		_id: new ObjectId(),
		FirstName,
		LastName,
		Login,
		Password,
		email,
		UserID,
		ShareKey: ShareKey || null,
		contact_list: []
	  };
  
	  const result = await db.collection('Users').insertOne(newUser);
  
	  // Initialize an empty schedule for the new user in the "Planners" collection
	  if (result.insertedId) {
		await db.collection('Planner').insertOne({
		  UserID,
		  schedule: []  // Empty schedule array
		});
		success = true;
	  } else {
		error = 'Failed to register user';
	  }
	} catch (err) {
	  console.error('Error during registration:', err);
	  error = 'Server error: ' + err.message;
	}
  
	res.status(success ? 200 : 500).json({ success, error });
});

//	addEvent API

app.post('/api/addEvent', async (req, res) => {
	const { UserID, event, desc, start, end, days } = req.body;
	let error = '';
	let success = false;

	try {
		const db = client.db('SchedulePlanner');

		// Verify if UserID is valid and convert it as needed
		const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

		// Define the new event object
		const newEvent = {
			event,
			desc,
			start,
			end,
			days  // Array of integers representing days (0 for Sunday, 6 for Saturday)
		};

		// Update the user's schedule array in the Planner collection
		const result = await db.collection('Planner').updateOne(
			{ UserID: userIdObj },  // Match the user by ID
			{ $push: { schedule: newEvent } }  // Add to the user's schedule array
		);

		// Check if the operation was successful
		if (result.modifiedCount > 0) {
			success = true;
		} else {
			error = 'Failed to add event';
		}
	} catch (err) {
		console.error('Error adding event:', err);
		error = 'Server error: ' + err.message;
	}

	res.status(success ? 200 : 500).json({ success, error });
});

//	View Schedule API (Work in progress)

//	deleteEvent API
app.post('/api/deleteEvent', async (req, res) => {
	const { UserID, event } = req.body; // Only require UserID and event title
	let error = '';
	let success = false;

	try {
		const db = client.db('SchedulePlanner');

		// Verify if UserID is valid and convert it as needed
		const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

		// Remove the specified event from the user's schedule array by event title
		const result = await db.collection('Planner').updateOne(
			{ UserID: userIdObj },  // Match the user by ID
			{ $pull: { schedule: { event } } }  // Remove by matching event title only
		);

		// Check if the operation was successful
		if (result.modifiedCount > 0) {
			success = true;
		} else {
			error = 'Failed to delete event';
		}
	} catch (err) {
		console.error('Error deleting event:', err);
		error = 'Server error: ' + err.message;
	}

	res.status(success ? 200 : 500).json({ success, error });
});


//	Add Friend API (Work in progress)

//	Delete Friend API (Work in progress)





app.listen(5000); // start Node + Express server on port 5000
