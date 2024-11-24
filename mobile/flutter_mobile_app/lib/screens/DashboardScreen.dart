import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/screens/CompareScreen.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart'; // Import for SystemUiOverlayStyle

class Dashboardscreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<Dashboardscreen> {
  List<Appointment> appointments = <Appointment>[];
  List<Map<String, dynamic>> contacts = []; // To store the user's contacts

  @override
  void initState() {
    super.initState();
    _fetchEvents();
    _fetchContacts();
  }

  Future<void> _fetchEvents() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('id');

      if (userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User not logged in')),
        );
        return;
      }

      final response = await http.post(
        Uri.parse('http://wattareyoudoing.us:5000/api/viewEvent'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({"UserID": int.parse(userId)}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List events = data['events'] ?? [];

        setState(() {
          appointments = events.expand<Appointment>((event) {
            return event['days'].map<Appointment>((dayIndex) {
              return Appointment(
                subject: event['event'] ?? 'No Title',
                startTime: _convertToDateTime(event['start'], dayIndex),
                endTime: _convertToDateTime(event['end'], dayIndex),
                notes:
                    '${event['desc'] ?? ''}\nStart: ${_convertToNormalTime(event['start'])}\nEnd: ${_convertToNormalTime(event['end'])}',
                color: Color(0xFFFF6B6B),
                id: event['eventID'],
              );
            }).toList();
          }).toList();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch events')),
        );
      }
    } catch (e) {
      print('Error fetching events: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching events')),
      );
    }
  }

  Future<void> _fetchContacts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('id');

      if (userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User not logged in')),
        );
        return;
      }

      final response = await http.post(
        Uri.parse('http://wattareyoudoing.us:5000/api/getContacts'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({"UserID": int.parse(userId)}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        setState(() {
          contacts = List<Map<String, dynamic>>.from(data['contacts']);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch contacts')),
        );
      }
    } catch (e) {
      print('Error fetching contacts: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching contacts: $e')),
      );
    }
  }

  Future<void> _addContact(String shareKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('id');

      if (userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User not logged in')),
        );
        return;
      }

      final response = await http.post(
        Uri.parse('http://wattareyoudoing.us:5000/api/addContact'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({"UserID": int.parse(userId), "ShareKey": shareKey}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Contact added successfully!')),
        );
        _fetchContacts(); // Refresh contacts
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add contact')),
        );
      }
    } catch (e) {
      print('Error adding contact: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding contact: $e')),
      );
    }
  }

  void _showAddContactDialog() {
    final TextEditingController shareKeyController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Add Contact'),
          content: TextField(
            controller: shareKeyController,
            decoration: InputDecoration(labelText: 'Enter ShareKey'),
          ),
          actions: [
            Column(
              crossAxisAlignment:
                  CrossAxisAlignment.stretch, // Stretch buttons to full width
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFFF6B6B),
                    padding: EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () {
                    final shareKey = shareKeyController.text.trim();
                    if (shareKey.isNotEmpty) {
                      _addContact(shareKey);
                      Navigator.pop(context);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Please enter a ShareKey')),
                      );
                    }
                  },
                  child: Text(
                    'Add',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                SizedBox(height: 10), // Space between buttons
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey,
                    padding: EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    "Close",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteContact(String userId, String shareKey) async {
    try {
      final response = await http.post(
        Uri.parse('http://wattareyoudoing.us:5000/api/deleteContact'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({"UserID": int.parse(userId), "ShareKey": shareKey}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Contact deleted successfully!')),
        );
        _fetchContacts(); // Refresh the contacts list after deletion
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete contact')),
        );
      }
    } catch (e) {
      print('Error deleting contact: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting contact: $e')),
      );
    }
  }

  void _showContactDetailsModal(Map<String, dynamic> contact) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Column(
            children: [
              Text(
                '${contact['firstName']} ${contact['lastName']}',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 5),
              Text(
                'Username: @${contact['Login']}',
                style: TextStyle(fontSize: 16),
              ),
              Text(
                'Share Key: ${contact['ShareKey']}',
                style: TextStyle(fontSize: 16),
              ),
            ],
          ),
          content: SizedBox(height: 20), // Add padding
          actions: [
            Column(
              crossAxisAlignment:
                  CrossAxisAlignment.stretch, // Stretch to full width
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFFF6B6B),
                    padding: EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () {
                    Navigator.pop(context); // Close modal
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CompareScreen(contact: contact),
                      ),
                    );
                  },
                  child: Text(
                    "Compare Schedules",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFFF6B6B),
                    padding: EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () async {
                    final prefs = await SharedPreferences.getInstance();
                    final userId = prefs.getString('id');

                    if (userId != null) {
                      Navigator.pop(context); // Close modal
                      await _deleteContact(userId, contact['ShareKey']);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('User not logged in')),
                      );
                    }
                  },
                  child: Text(
                    "Delete Contact",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey,
                    padding: EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    "Close",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  DateTime _convertToDateTime(String time, int dayIndex) {
    final hour = int.parse(time.substring(0, 2));
    final minute = int.parse(time.substring(2, 4));

    final now = DateTime.now();
    final currentWeekday = (now.weekday % 7);
    final difference = dayIndex - currentWeekday;
    final targetDate = now.add(Duration(days: difference));

    return DateTime(
        targetDate.year, targetDate.month, targetDate.day, hour, minute);
  }

  String _convertToNormalTime(String militaryTime) {
    final hour = int.parse(militaryTime.substring(0, 2));
    final minute = int.parse(militaryTime.substring(2, 4));
    final period = hour >= 12 ? 'PM' : 'AM';
    final adjustedHour = hour % 12 == 0 ? 12 : hour % 12;
    return '$adjustedHour:${minute.toString().padLeft(2, '0')} $period';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Dashboard"),
        backgroundColor: Color(0xFFFFD6A5),
        centerTitle: true, // Aligns the title to the center
      ),
      body: Container(
        color: Color.fromARGB(255, 255, 255, 255),
        child: Column(
          children: [
            // Contacts Section
            Container(
              color: Color.fromARGB(255, 255, 255, 255),
              height: MediaQuery.of(context).size.height * 0.3, // Adjust height
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Your Friends",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 10),
                  Expanded(
                    child: Stack(
                      children: [
                        Scrollbar(
                          thumbVisibility: true,
                          child: ListView.builder(
                            itemCount: contacts.length + 1,
                            itemBuilder: (context, index) {
                              if (index == contacts.length) {
                                return ListTile(
                                  leading:
                                      Icon(Icons.add, color: Color(0xFFFF6B6B)),
                                  title: Text(
                                    "Add Contact",
                                    style: TextStyle(color: Color(0xFFFF6B6B)),
                                  ),
                                  onTap: _showAddContactDialog,
                                );
                              }

                              final contact = contacts[index];
                              return ListTile(
                                leading: CircleAvatar(
                                  child: Text(
                                    contact['firstName'][0],
                                    style: TextStyle(color: Colors.white),
                                  ),
                                  backgroundColor: Color(0xFFFF6B6B),
                                ),
                                title: Text(
                                  "${contact['Login']}",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                subtitle: Text(
                                    "${contact['firstName']} ${contact['lastName']}"),
                                onTap: () => _showContactDetailsModal(contact),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Calendar Section
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.only(left: 16.0, top: 8.0),
                    child: Text(
                      "Your Schedule",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      margin: EdgeInsets.all(16.0),
                      padding: EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(1),
                            spreadRadius: 5,
                            blurRadius: 7,
                            offset: Offset(0, 3), // changes position of shadow
                          ),
                        ],
                      ),
                      child: SfCalendar(
                        view: CalendarView.week,
                        dataSource: EventDataSource(appointments),
                        todayHighlightColor:
                            Color.fromARGB(255, 0, 0, 0), // Current day color
                        selectionDecoration: BoxDecoration(
                          border: Border.all(
                            color: Color.fromARGB(
                                255, 0, 0, 0), // Highlight border color
                            width: 2,
                          ),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        showDatePickerButton: false,
                        allowedViews: [CalendarView.week],
                        headerHeight: 0,
                        viewHeaderStyle: ViewHeaderStyle(
                          dateTextStyle: TextStyle(fontSize: 0),
                          dayTextStyle: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        timeSlotViewSettings: TimeSlotViewSettings(
                          timeInterval: Duration(hours: 1),
                          timeFormat: 'h a',
                          startHour: 0,
                          endHour: 24,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class EventDataSource extends CalendarDataSource {
  EventDataSource(List<Appointment> appointments) {
    this.appointments = appointments;
  }
}
