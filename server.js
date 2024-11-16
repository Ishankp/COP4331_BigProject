
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



// Login API
app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    const { login, password } = req.body;
    const db = client.db('SchedulePlanner');
    
    try {
        const results = await db.collection('Users').findOne({ Login: login, Password: password });
        
        if (results) {
            const ret = { 
                id: results.UserID,            // Ensure `UserID` matches exactly with MongoDB field name
                firstName: results.FirstName, 
                lastName: results.LastName, 
                token: results.token,
                isVerified: results.isVerified,
                error: '' ,
                email: results.email
            };
            res.status(200).json(ret);
        } else {
            res.status(200).json({ id: -1, firstName: '', lastName: '', error: 'User not found' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ id: -1, firstName: '', lastName: '', error: 'Server error' });
    }
});



//	Register API
const { ObjectId } = require('mongodb');  // Ensure ObjectId is imported
app.post('/api/register', async (req, res) => {
	const { FirstName, LastName, Login, Password, email, ShareKey, isVerified, token } = req.body;
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
		contact_list: [],
        isVerified,
        token
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

app.post('/api/verify_user', async (req, res, next) => {
    // incoming: login, password
    // outgoing: isVerified
    const { login, password } = req.body;
    let error = '';
    let success = false;

    const db = client.db('SchedulePlanner');
    try {
        const updatedVerification = {...{isVerified: true}};
        const results = await db.collection('Users').updateOne(
            { Login: login, Password: password },
            { $set: updatedVerification}
        );
        if (results.modifiedCount > 0) {
            success = true;
        }
        else {
            error = 'Server failed to verify user';
        }
    } catch (err) {
        console.error('Error during user verification', err);
        res.status(500).json({ id: -1, firstName: '', lastName: '', error: 'Server error' });
    }

    res.status(success ? 200 : 500).json({ success, error })
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

        // Check if an event with the same name already exists in the user's schedule
        const existingEvent = await db.collection('Planner').findOne(
            { UserID: userIdObj, 'schedule.event': event }
        );

        if (existingEvent) {
            error = 'Event with this name already exists';
            return res.status(400).json({ success, error });
        }

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



// updateEvent API
app.put('/api/updateEvent', async (req, res) => {
	const { UserID, currentEvent, newEvent, newDesc, newStart, newEnd, newDays } = req.body;
	let error = '';
	let success = false;

	try {
		const db = client.db('SchedulePlanner');

		// Verify if UserID is valid and convert it as needed
		const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

		// Define the updated fields object conditionally
		const updatedFields = {
			...(newEvent && { 'schedule.$.event': newEvent }),
			...(newDesc && { 'schedule.$.desc': newDesc }),
			...(newStart && { 'schedule.$.start': newStart }),
			...(newEnd && { 'schedule.$.end': newEnd }),
			...(newDays && { 'schedule.$.days': newDays }),
		};

		// Update the specified event within the user's schedule by currentEvent (original event name)
		const result = await db.collection('Planner').updateOne(
			{ UserID: userIdObj, 'schedule.event': currentEvent },  // Match by user and original event name
			{ $set: updatedFields }  // Update only specified fields
		);

		// Check if the operation was successful
		if (result.modifiedCount > 0) {
			success = true;
		} else {
			error = 'Failed to update event';
		}
	} catch (err) {
		console.error('Error updating event:', err);
		error = 'Server error: ' + err.message;
	}

	res.status(success ? 200 : 500).json({ success, error });
});



//	addContact API
app.post('/api/addContact', async (req, res) => {
    let { UserID, contactID } = req.body;
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Ensure userID and contactID are treated as integers
        userID = parseInt(UserID, 10);
        contactID = parseInt(contactID, 10);

        // Log the parsed userID and contactID to debug if they're correctly parsed
        console.log("Parsed userID:", userID);
        console.log("Parsed contactID:", contactID);

        // Check if both user and contact exist
        const user = await db.collection('Users').findOne({ UserID: userID });
        const contact = await db.collection('Users').findOne({ UserID: contactID });

        if (!user) {
            error = 'User not found';
            return res.status(404).json({ success, error });
        }

        if (!contact) {
            error = 'Contact not found';
            return res.status(404).json({ success, error });
        }

        // Check if contact is already in the user's contact list
        if (user.contact_list.includes(contactID)) {
            error = 'Contact already added';
            return res.status(400).json({ success, error });
        }

        // Add contactID to user's contact_list
        const result = await db.collection('Users').updateOne(
            { UserID: userID },
            { $push: { contact_list: contactID } }
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to add contact';
        }
    } catch (err) {
        console.error('Error adding contact:', err);
        error = 'Server error: ' + err.message;
    }

    res.status(success ? 200 : 500).json({ success, error });
});



// deleteContact API
app.post('/api/deleteContact', async (req, res) => {
    let { UserID, contactID } = req.body;
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Ensure userID and contactID are treated as integers
        userID = parseInt(UserID, 10);
        contactID = parseInt(contactID, 10);

        // Log the parsed userID and contactID for debugging
        console.log("Parsed userID:", userID);
        console.log("Parsed contactID:", contactID);

        // Check if both user and contact exist
        const user = await db.collection('Users').findOne({ UserID: userID });
        const contact = await db.collection('Users').findOne({ UserID: contactID });

        if (!user) {
            error = 'User not found';
            return res.status(404).json({ success, error });
        }

        if (!contact) {
            error = 'Contact not found';
            return res.status(404).json({ success, error });
        }

        // Check if contact is actually in the user's contact list
        if (!user.contact_list.includes(contactID)) {
            error = 'Contact not found in user\'s contact list';
            return res.status(400).json({ success, error });
        }

        // Remove contactID from user's contact_list
        const result = await db.collection('Users').updateOne(
            { UserID: userID },
            { $pull: { contact_list: contactID } }
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to delete contact';
        }
    } catch (err) {
        console.error('Error deleting contact:', err);
        error = 'Server error: ' + err.message;
    }

    res.status(success ? 200 : 500).json({ success, error });
});



// viewEvent API
app.post('/api/viewEvent', async (req, res) => {
    const { UserID } = req.body; // Expecting UserID in the request body
    let error = '';
    let events = [];

    try {
        const db = client.db('SchedulePlanner');

        // Convert UserID to the appropriate type if needed
        const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

        // Find the user's planner document by UserID
        const userPlanner = await db.collection('Planner').findOne({ UserID: userIdObj });

        if (userPlanner && userPlanner.schedule) {
            events = userPlanner.schedule; // Set the events array from the user's schedule
        } else {
            error = 'No events found or invalid UserID';
        }
    } catch (err) {
        console.error('Error fetching events:', err);
        error = 'Server error: ' + err.message;
    }

    res.status(error ? 500 : 200).json({ events, error });
});



//	Email Lost Password API (Work in progress)



app.listen(5000); // start Node + Express server on port 5000
