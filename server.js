import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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

async function sendResetEmail(message, email_address) {
    const result = await emailjs.send(
        'service_qi1sbur',
        'template_p1dipwy',
        {
        user_email: email_address,
        message: message,
        },
        'mfbP6q5wTnsFmAZvR'
    );
    return result;
}

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
                ShareKey: results.ShareKey || '',
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

// verify_user API
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


//  addEvent API
app.post('/api/addEvent', async (req, res) => {
    const { UserID, event, desc, start, end, days } = req.body;
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Verify if UserID is valid
        const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

        // Create eventID using ObjectId or other method
        const eventID = new ObjectId(); // Unique identifier for the event

        // Define the new event object with eventID
        const newEvent = {
            eventID, // Include the eventID field
            event,
            desc,
            start,
            end,
            days
        };

        // Update the user's schedule in the Planner collection
        const result = await db.collection('Planner').updateOne(
            { UserID: userIdObj }, // Match by UserID
            { $push: { schedule: newEvent } } // Add event to schedule array
        );

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
    const { UserID, eventID } = req.body; // Expect eventID as ObjectId in the request
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Ensure eventID is a valid ObjectId
        const eventObjectId = ObjectId.isValid(eventID) ? new ObjectId(eventID) : null;
        if (!eventObjectId) {
            return res.status(400).json({ success, error: 'Invalid eventID' });
        }

        // Verify if UserID is valid
        const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

        // Remove event by eventID from the user's schedule
        const result = await db.collection('Planner').updateOne(
            { UserID: userIdObj }, // Match by UserID
            { $pull: { schedule: { eventID: eventObjectId } } } // Remove event by eventID
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to delete event or event not found';
        }
    } catch (err) {
        console.error('Error deleting event:', err);
        error = 'Server error: ' + err.message;
    }

    res.status(success ? 200 : 500).json({ success, error });
});



// updateEvent API
app.put('/api/updateEvent', async (req, res) => {
    const { UserID, eventID, newEvent, newDesc, newStart, newEnd, newDays } = req.body;
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Ensure eventID is a valid ObjectId
        const eventObjectId = ObjectId.isValid(eventID) ? new ObjectId(eventID) : null;
        if (!eventObjectId) {
            return res.status(400).json({ success, error: 'Invalid eventID' });
        }

        // Verify if UserID is valid
        const userIdObj = typeof UserID === 'string' && ObjectId.isValid(UserID) ? new ObjectId(UserID) : parseInt(UserID);

        // Define the updated fields conditionally
        const updatedFields = {
            ...(newEvent && { 'schedule.$.event': newEvent }),
            ...(newDesc && { 'schedule.$.desc': newDesc }),
            ...(newStart && { 'schedule.$.start': newStart }),
            ...(newEnd && { 'schedule.$.end': newEnd }),
            ...(newDays && { 'schedule.$.days': newDays }),
        };

        // Update the event by eventID
        const result = await db.collection('Planner').updateOne(
            { UserID: userIdObj, 'schedule.eventID': eventObjectId }, // Match by UserID and eventID
            { $set: updatedFields } // Update only specified fields
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to update event or event not found';
        }
    } catch (err) {
        console.error('Error updating event:', err);
        error = 'Server error: ' + err.message;
    }

    res.status(success ? 200 : 500).json({ success, error });
});


// addContact
app.post('/api/addContact', async (req, res) => {
    const { UserID, ShareKey } = req.body; // Use ShareKey instead of contactID
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Ensure UserID is treated as an integer
        const userID = parseInt(UserID, 10);

        // Find the current user
        const user = await db.collection('Users').findOne({ UserID: userID });
        if (!user) {
            error = 'User not found';
            return res.status(404).json({ success, error });
        }

        // Find the contact using ShareKey
        const contact = await db.collection('Users').findOne({ ShareKey: ShareKey });
        if (!contact) {
            error = 'Contact not found using provided ShareKey';
            return res.status(404).json({ success, error });
        }

        // Check if contact is already in the user's contact list
        if (user.contact_list && user.contact_list.some(c => c.UserID === contact.UserID)) {
            error = 'Contact already added';
            return res.status(400).json({ success, error });
        }


        // Add the contact's details to the user's contact list
        const result = await db.collection('Users').updateOne(
            { UserID: userID },
            {
                $push: {
                    contact_list: {
                        UserID: contact.UserID,
                        firstName: contact.FirstName,
                        lastName: contact.LastName,
                        Login: contact.Login,
                        ShareKey: contact.ShareKey,
                    },
                },
            }
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



//getContacts
app.post('/api/getContacts', async (req, res) => {
    const { UserID } = req.body;
    let error = '';
    let contacts = [];

    try {
        const db = client.db('SchedulePlanner');

        // Ensure UserID is treated as an integer
        const userID = parseInt(UserID, 10);

        // Find the user by their UserID
        const user = await db.collection('Users').findOne({ UserID: userID });
        if (!user) {
            error = 'User not found';
            return res.status(404).json({ error });
        }

        // Return the user's contact list
        contacts = user.contact_list || [];
        res.status(200).json({ contacts });
    } catch (err) {
        console.error('Error fetching contacts:', err);
        error = 'Server error: ' + err.message;
        res.status(500).json({ error });
    }
});



// deleteContact
app.post('/api/deleteContact', async (req, res) => {
    let { UserID, ShareKey } = req.body; // Replace contactID with ShareKey
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        // Ensure UserID is treated as an integer
        const userID = parseInt(UserID, 10);

        // // Log for debugging
        // console.log("Parsed userID:", userID);
        // console.log("Provided ShareKey:", ShareKey);

        // Find the current user
        const user = await db.collection('Users').findOne({ UserID: userID });
        if (!user) {
            error = 'User not found';
            return res.status(404).json({ success, error });
        }

        // Find the contact using ShareKey
        const contact = await db.collection('Users').findOne({ ShareKey: ShareKey });
        if (!contact) {
            error = 'Contact not found using provided ShareKey';
            return res.status(404).json({ success, error });
        }

        // Check if the contact is in the user's contact list
        if (!user.contact_list.some(c => c.UserID === contact.UserID)) {
            error = 'Contact not found in user\'s contact list';
            return res.status(400).json({ success, error });
        }

        // Remove the contact from the user's contact_list
        const result = await db.collection('Users').updateOne(
            { UserID: userID },
            { $pull: { contact_list: { UserID: contact.UserID } } } // Match the object with UserID
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



// getCombinedEvents
app.post('/api/getCombinedEvents', async (req, res) => {
    const { UserID, FriendID } = req.body;
  
    try {
      if (!UserID || !FriendID) {
        return res.status(400).json({ error: 'Both UserID and FriendID are required.' });
      }
  
      const db = client.db('SchedulePlanner');
  
      // Ensure UserID and FriendID are integers
      const userID = parseInt(UserID, 10);
      const friendID = parseInt(FriendID, 10);
  
      // Fetch schedules for both users
      const user = await db.collection('Planner').findOne({ UserID: userID });
      const friend = await db.collection('Planner').findOne({ UserID: friendID });
  
      if (!user || !user.schedule) {
        return res.status(404).json({ error: 'User schedule not found.' });
      }
  
      if (!friend || !friend.schedule) {
        return res.status(404).json({ error: 'Friend schedule not found.' });
      }
  
      // Combine the schedules with UserID included
      const combinedEvents = [
        ...user.schedule.map(event => ({
          eventID: event.eventID,
          event: event.event,
          desc: event.desc || '',
          start: event.start,
          end: event.end,
          days: event.days || [],
          userID: user.UserID, // Add UserID to identify the owner of the event
        })),
        ...friend.schedule.map(event => ({
          eventID: event.eventID,
          event: event.event,
          desc: event.desc || '',
          start: event.start,
          end: event.end,
          days: event.days || [],
          userID: friend.UserID, // Add UserID to identify the owner of the event
        })),
      ];
  
      // Return the combined events
      res.json({ events: combinedEvents });
    } catch (error) {
      console.error('Error fetching combined events:', error);
      res.status(500).json({ error: 'Error fetching combined events' });
    }
  });
  
//Request Reset Password API
app.post('/api/resetPasswordRequest', async (req, res) => {
    let error = '';
    let success = false;
    let token = '';
    const { email } = req.body;

    try { 
        // Check if the email exists in your database
        const db = client.db('SchedulePlanner');
        
        const user = await db.collection('Users').findOne({ email: email });
        if (!user) {
            error = 'User not found';
            return res.status(404).json({ success, error });
        }

        // Generate a secure token

        token = crypto.randomBytes(32).toString('hex');
        Object.freeze(token); //Ensures token can not be changed


        // Save the token and expiration time in the database
        const updatedFields = {
            ...({resetPasswordToken: token}),
            ...({resetPasswordExpire: Date.now() + 15 * 60 * 1000})
        }

        const result = await db.collection('Users').updateOne(
            { email: email},
            { $set: updatedFields }
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to reset password for user';
        }
    } 
    catch (err) {
        console.error('Error resetting password:', err);
        error = 'Server error: ' + err.message;
    }

    // Send the reset password email

    res.status(200).json({ resetPasswordToken: token, success: success });
});


//Request Reset Password API (Mobile)
app.post('/api/resetPasswordRequestMobile', async (req, res) => {
    let error = '';
    let success = false;
    let token = '';
    const { email } = req.body;

    try { 
        // Check if the email exists in your database
        const db = client.db('SchedulePlanner');
        
        const user = await db.collection('Users').findOne({ email: email });
        if (!user) {
            error = 'User not found';
            return res.status(404).json({ success, error });
        }

        // Generate a secure token

        token = crypto.randomInt(100000, 1000000).toString();
        Object.freeze(token); //Ensures token can not be changed


        // Save the token and expiration time in the database
        const updatedFields = {
            ...({resetPasswordToken: token}),
            ...({resetPasswordExpire: Date.now() + 15 * 60 * 1000})
        }

        const result = await db.collection('Users').updateOne(
            { email: email},
            { $set: updatedFields }
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to reset password for user';
        }
    } 
    catch (err) {
        console.error('Error resetting password:', err);
        error = 'Server error: ' + err.message;
    }

    // Send the reset password email

    res.status(200).json({ resetPasswordToken: token, success: success });
});


//Update DB with new Password 
app.post('/api/resetPassword', async (req, res) => {
    const { newPassword, resetPasswordToken } = req.body;
    let error = '';
    let success = false;

    try {
        const db = client.db('SchedulePlanner');

        const user = await db.collection('Users').findOne({ resetPasswordToken: resetPasswordToken });
        if (!user) {
            error = 'Current reset password link is expired, please request another one if needed';
            return res.status(404).json({ success, error });
        }
        if (user.resetPasswordExpire < Date.now()) {
            error = "Current reset password link is expired, please request another one if needed";
            return res.status(404).json({success, error});
        }

        // Define the updated fields conditionally
        const updatedFields = {
            ...(newPassword && { Password: newPassword }),
            ...({resetPasswordToken: ''}),
            ...({resetPasswordExpire: 0.0}),
        };

        // Update the user's password
        const result = await db.collection('Users').updateOne(
            { resetPasswordToken: resetPasswordToken}, 
            { $set: updatedFields }
        );

        if (result.modifiedCount > 0) {
            success = true;
        } else {
            error = 'Failed to reset password';
        }
    } catch (err) {
        console.error('Error resetting password:', err);
        error = 'Server error: ' + err.message;
    }

    res.status(success ? 200 : 500).json({ success, error });
}); 

app.listen(5000); // start Node + Express server on port 5000