import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_mobile_app/screens/DashboardScreen.dart';

class CreateScheduleScreen extends StatefulWidget {
  @override
  _CreateScheduleScreenState createState() => _CreateScheduleScreenState();
}

class _CreateScheduleScreenState extends State<CreateScheduleScreen> {
  final String serverUrl = 'http://wattareyoudoing.us:5000/api/addEvent';
  final String fetchEventsUrl = 'http://wattareyoudoing.us:5000/api/viewEvent';
  final String updateEventUrl =
      'http://wattareyoudoing.us:5000/api/updateEvent';
  final String deleteEventUrl =
      'http://wattareyoudoing.us:5000/api/deleteEvent';

  final List<String> timeOptions = [
    "12:00 AM",
    "12:30 AM",
    "1:00 AM",
    "1:30 AM",
    "2:00 AM",
    "2:30 AM",
    "3:00 AM",
    "3:30 AM",
    "4:00 AM",
    "4:30 AM",
    "5:00 AM",
    "5:30 AM",
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  final List<String> dayOptions = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  List<Appointment> _appointments = [];

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  void _showAddOrEditEventDialog({Appointment? existingEvent}) {
    final TextEditingController eventNameController =
        TextEditingController(text: existingEvent?.subject ?? '');
    final TextEditingController eventDescController =
        TextEditingController(text: existingEvent?.notes?.split('\n')[0] ?? '');
    String? selectedStartTime = existingEvent != null
        ? _convertToNormalTime(
            '${existingEvent.startTime.hour.toString().padLeft(2, '0')}${existingEvent.startTime.minute.toString().padLeft(2, '0')}')
        : null;
    String? selectedEndTime = existingEvent != null
        ? _convertToNormalTime(
            '${existingEvent.endTime.hour.toString().padLeft(2, '0')}${existingEvent.endTime.minute.toString().padLeft(2, '0')}')
        : null;

    List<int> selectedDays =
        // ignore: unnecessary_null_comparison
        existingEvent != null && existingEvent.startTime != null
            ? [
                (existingEvent.startTime.weekday % 7) // Map to backend format
              ]
            : [];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text(existingEvent == null ? 'Add Event' : 'Edit Event'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: eventNameController,
                      decoration: InputDecoration(labelText: 'Event Name'),
                    ),
                    DropdownButtonFormField<String>(
                      value: selectedStartTime,
                      decoration: InputDecoration(labelText: 'Start Time'),
                      items: timeOptions
                          .map((time) => DropdownMenuItem(
                                value: time,
                                child: Text(time),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setDialogState(() {
                          selectedStartTime = value;
                        });
                      },
                    ),
                    DropdownButtonFormField<String>(
                      value: selectedEndTime,
                      decoration: InputDecoration(labelText: 'End Time'),
                      items: timeOptions
                          .map((time) => DropdownMenuItem(
                                value: time,
                                child: Text(time),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setDialogState(() {
                          selectedEndTime = value;
                        });
                      },
                    ),
                    SizedBox(height: 10),
                    Text('Select Days:'),
                    Wrap(
                      children: dayOptions.asMap().entries.map((entry) {
                        final index = entry.key;
                        final day = entry.value;
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4.0),
                          child: FilterChip(
                            label: Text(day),
                            selected: selectedDays.contains(index),
                            onSelected: (isSelected) {
                              setDialogState(() {
                                if (isSelected) {
                                  selectedDays.add(index);
                                } else {
                                  selectedDays.remove(index);
                                }
                              });
                            },
                          ),
                        );
                      }).toList(),
                    ),
                    TextField(
                      controller: eventDescController,
                      decoration: InputDecoration(labelText: 'Description'),
                    ),
                  ],
                ),
              ),
              actions: [
                if (existingEvent != null)
                  TextButton(
                    child: Text('Delete'),
                    onPressed: () async {
                      await _deleteEvent(existingEvent.id as String?);
                      Navigator.pop(context);
                      _fetchEvents(); // Refresh events after deletion
                    },
                  ),
                TextButton(
                  child: Text('Cancel'),
                  onPressed: () => Navigator.pop(context),
                ),
                TextButton(
                  child: Text('Save'),
                  onPressed: () async {
                    final String eventName = eventNameController.text.trim();
                    final String eventDesc = eventDescController.text.trim();

                    if (eventName.isEmpty ||
                        selectedStartTime == null ||
                        selectedEndTime == null ||
                        selectedDays.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('All fields are required!')),
                      );
                      return;
                    }

                    try {
                      final String startTime =
                          _convertToMilitaryTime(selectedStartTime!);
                      final String endTime =
                          _convertToMilitaryTime(selectedEndTime!);

                      if (existingEvent == null) {
                        await _addEvent(eventName, startTime, endTime,
                            eventDesc, selectedDays);
                      } else {
                        await _editEvent(
                          existingEvent.id
                              ?.toString(), // Ensure eventID is cast to String
                          eventName,
                          startTime,
                          endTime,
                          eventDesc,
                          selectedDays,
                        );
                      }

                      Navigator.pop(context);
                      _fetchEvents(); // Refresh events after adding/editing
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error processing times: $e')),
                      );
                    }
                  },
                ),
              ],
            );
          },
        );
      },
    );
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
        Uri.parse(fetchEventsUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({"UserID": int.parse(userId)}),
      );

      print('Response Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List events = data['events'] ?? [];

        setState(() {
          _appointments = events.expand<Appointment>((event) {
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

        print('Appointments: $_appointments');
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

  Future<void> _addEvent(String name, String startTime, String endTime,
      String desc, List<int> days) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('id');

      if (userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User not logged in.')),
        );
        return;
      }

      for (int day in days) {
        final payload = {
          "UserID": int.parse(userId),
          "event": name,
          "desc": desc,
          "start": startTime,
          "end": endTime,
          "days": [day],
        };

        await http.post(
          Uri.parse(serverUrl),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(payload),
        );
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Event added successfully!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding event')),
      );
    }
  }

  Future<void> _editEvent(String? eventId, String name, String startTime,
      String endTime, String desc, List<int> newDays) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('id');

      if (userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User not logged in.')),
        );
        return;
      }

      if (eventId == null || eventId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Event ID is missing or invalid.')),
        );
        return;
      }

      // Fetch the original event's days and details from existing appointments
      final Appointment originalEvent = _appointments.firstWhere(
        (e) => e.id == eventId,
        orElse: () => Appointment(
          subject: 'Invalid',
          startTime: DateTime.now(),
          endTime: DateTime.now(),
          color: Colors.transparent,
          id: 'Invalid',
        ),
      );

      if (originalEvent.id == 'Invalid') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Original event not found.')),
        );
        return;
      }

      // Extract the original days and details
      final List<int> originalDays = [
        (originalEvent.startTime.weekday % 7) // Extract the day
      ];
      final String originalStartTime =
          '${originalEvent.startTime.hour.toString().padLeft(2, '0')}${originalEvent.startTime.minute.toString().padLeft(2, '0')}';
      final String originalEndTime =
          '${originalEvent.endTime.hour.toString().padLeft(2, '0')}${originalEvent.endTime.minute.toString().padLeft(2, '0')}';
      final String originalDesc = originalEvent.notes?.split('\n')[0] ?? '';
      final String originalName = originalEvent.subject;

      // Check if there are any changes
      final bool hasChanges = originalStartTime != startTime ||
          originalEndTime != endTime ||
          originalDesc != desc ||
          originalName != name;

      // Find new days to add
      final List<int> daysToAdd =
          newDays.where((day) => !originalDays.contains(day)).toList();

      // Update the original event if there are changes
      if (hasChanges) {
        final payload = {
          "UserID": int.parse(userId),
          "eventID": eventId,
          "newEvent": name,
          "newDesc": desc,
          "newStart": startTime,
          "newEnd": endTime,
          "newDays": [originalDays.first], // Keep the original day
        };

        print('Edit Event Payload: $payload');

        final response = await http.put(
          Uri.parse(updateEventUrl),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(payload),
        );

        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Event updated successfully!')),
          );
        } else {
          print(
              'Failed to update the original event. Response: ${response.body}');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to update the original event.')),
          );
        }
      } else {
        print('No changes detected for the original event.');
      }

      // Add new events for additional days
      for (int day in daysToAdd) {
        await _addEvent(name, startTime, endTime, desc, [day]);
      }

      // Refresh events
      _fetchEvents();
    } catch (e) {
      print('Error updating event: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating event: $e')),
      );
    }
  }

  Future<void> _deleteEvent(String? eventId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('id');

      if (userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User not logged in.')),
        );
        return;
      }

      if (eventId == null || eventId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Event ID is missing or invalid.')),
        );
        return;
      }

      final payload = {
        "UserID": int.parse(userId),
        "eventID": eventId.toString(),
      };

      print('Delete Event Payload: $payload');

      final response = await http.post(
        Uri.parse(deleteEventUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );

      print('Response Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Event deleted successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete event.')),
        );
      }
    } catch (e) {
      print('Error deleting event: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting event: $e')),
      );
    }
  }

  String _convertToMilitaryTime(String time) {
    final RegExp regExp =
        RegExp(r'(\d+):?(\d{0,2})?\s*(AM|PM)', caseSensitive: false);
    final match = regExp.firstMatch(time);

    if (match == null) {
      throw FormatException('Invalid time format: $time');
    }

    int hour = int.parse(match.group(1)!);
    int minute = match.group(2) != null && match.group(2)!.isNotEmpty
        ? int.parse(match.group(2)!)
        : 0;
    final String period = match.group(3)!.toUpperCase();

    if (period == 'PM' && hour != 12) {
      hour += 12;
    } else if (period == 'AM' && hour == 12) {
      hour = 0;
    }

    return '${hour.toString().padLeft(2, '0')}${minute.toString().padLeft(2, '0')}';
  }

  String _convertToNormalTime(String militaryTime) {
    final hour = int.parse(militaryTime.substring(0, 2));
    final minute = int.parse(militaryTime.substring(2, 4));
    final period = hour >= 12 ? 'PM' : 'AM';
    final adjustedHour = hour % 12 == 0 ? 12 : hour % 12;
    return '$adjustedHour:${minute.toString().padLeft(2, '0')} $period';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Schedule'),
        backgroundColor: Color(0xFFFFD6A5),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _fetchEvents,
          ),
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => _showAddOrEditEventDialog(),
          ),
          IconButton(
            icon: Icon(Icons.done),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => Dashboardscreen()),
              );
            },
          ),
        ],
      ),
      body: Container(
        color: Color.fromARGB(255, 255, 255, 255),
        child: Column(
          children: [
            Expanded(
              child: SfCalendar(
                view: CalendarView.week,
                dataSource: EventDataSource(_appointments),
                todayHighlightColor:
                    Color.fromARGB(255, 0, 0, 0), // Current day color
                selectionDecoration: BoxDecoration(
                  border: Border.all(
                    color:
                        Color.fromARGB(255, 0, 0, 0), // Highlight border color
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                showDatePickerButton: false,
                allowedViews: [CalendarView.week],
                headerHeight: 0,
                viewHeaderStyle: ViewHeaderStyle(
                  dateTextStyle: TextStyle(fontSize: 0),
                  dayTextStyle:
                      TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                timeSlotViewSettings: TimeSlotViewSettings(
                  timeInterval: Duration(hours: 1),
                  timeFormat: 'h a',
                  startHour: 0,
                  endHour: 24,
                ),
                onTap: (details) {
                  if (details.appointments != null &&
                      details.appointments!.isNotEmpty) {
                    final Appointment tappedAppointment =
                        details.appointments!.first;
                    _showAddOrEditEventDialog(existingEvent: tappedAppointment);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class EventDataSource extends CalendarDataSource {
  EventDataSource(List<Appointment> source) {
    appointments = source;
  }
}
