import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CompareScreen extends StatefulWidget {
  final Map<String, dynamic> contact;

  CompareScreen({required this.contact});

  @override
  _CompareScreenState createState() => _CompareScreenState();
}

class _CompareScreenState extends State<CompareScreen> {
  List<Appointment> userAppointments = [];
  List<Appointment> contactAppointments = [];
  final String fetchEventsUrl = 'http://wattareyoudoing.us:5000/api/viewEvent';

  @override
  void initState() {
    super.initState();
    _fetchUserEvents();
    _fetchContactEvents();
  }

  Future<void> _fetchUserEvents() async {
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

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List events = data['events'] ?? [];

        setState(() {
          userAppointments = events.expand<Appointment>((event) {
            return event['days'].map<Appointment>((dayIndex) {
              return Appointment(
                subject: event['event'] ?? 'No Title',
                startTime: _convertToDateTime(event['start'], dayIndex),
                endTime: _convertToDateTime(event['end'], dayIndex),
                notes: '${event['desc'] ?? ''}',
                color: Color(0xFFFF6B6B), // User's events in red
                id: event['eventID'],
              );
            }).toList();
          }).toList();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch user events')),
        );
      }
    } catch (e) {
      print('Error fetching user events: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching user events')),
      );
    }
  }

  Future<void> _fetchContactEvents() async {
    try {
      final response = await http.post(
        Uri.parse(fetchEventsUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({"UserID": widget.contact['UserID']}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List events = data['events'] ?? [];

        setState(() {
          contactAppointments = events.expand<Appointment>((event) {
            return event['days'].map<Appointment>((dayIndex) {
              return Appointment(
                subject: event['event'] ?? 'No Title',
                startTime: _convertToDateTime(event['start'], dayIndex),
                endTime: _convertToDateTime(event['end'], dayIndex),
                notes: '${event['desc'] ?? ''}',
                color: Color(0xFF4ECDC4), // Contact's events in teal
                id: event['eventID'],
              );
            }).toList();
          }).toList();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch contact events')),
        );
      }
    } catch (e) {
      print('Error fetching contact events: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching contact events')),
      );
    }
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

  void _showEventDetails(Appointment appointment) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          title: Text(
            appointment.subject,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Start Time: ${_formatTime(appointment.startTime)}"),
              Text("End Time: ${_formatTime(appointment.endTime)}"),
              if (appointment.notes != null && appointment.notes!.isNotEmpty)
                Text("Description: ${appointment.notes}"),
              SizedBox(height: 10),
              Text(
                "This event belongs to ${appointment.color == Color(0xFFFF6B6B) ? 'You' : widget.contact['Login']}.",
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          ),
          actionsAlignment: MainAxisAlignment.center, // Center the close button
          actions: [
            SizedBox(
              width: double
                  .infinity, // Makes the button take the full width of the parent
              child: ElevatedButton(
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
            ),
          ],
        );
      },
    );
  }

  /// Helper function to format DateTime to 'hh:mm AM/PM'
  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    final hour = dateTime.hour % 12 == 0 ? 12 : dateTime.hour % 12;
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final period = dateTime.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Compare Schedules'),
        backgroundColor: Color(0xFFFFD6A5),
        shadowColor: Color(0xFFFFD6A5),
        elevation: 0,
        centerTitle: true,
      ),
      body: Container(
        color: Color.fromARGB(255, 255, 255, 255),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Text(
                    'Comparing with @${widget.contact['Login']}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      LegendItem(
                          color: Color(0xFFFF6B6B), label: "Your Events"),
                      SizedBox(width: 20),
                      LegendItem(
                          color: Color(0xFF4ECDC4), label: "Contact's Events"),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: SfCalendar(
                view: CalendarView.week,
                dataSource: CombinedEventDataSource(
                  userAppointments + contactAppointments,
                ),
                todayHighlightColor: Color.fromARGB(255, 0, 0, 0),
                selectionDecoration: BoxDecoration(
                  border: Border.all(
                    color: Color.fromARGB(255, 0, 0, 0),
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                onTap: (details) {
                  if (details.appointments != null &&
                      details.appointments!.isNotEmpty) {
                    _showEventDetails(
                        details.appointments!.first as Appointment);
                  }
                },
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
          ],
        ),
      ),
    );
  }
}

class CombinedEventDataSource extends CalendarDataSource {
  CombinedEventDataSource(List<Appointment> source) {
    appointments = source;
  }
}

class LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(fontSize: 14),
        ),
      ],
    );
  }
}
