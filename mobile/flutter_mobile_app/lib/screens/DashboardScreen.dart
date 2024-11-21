import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

class Dashboardscreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<Dashboardscreen> {
  List<Appointment> appointments = <Appointment>[];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Schedule"),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () {
              _showAddEventDialog(context);
            },
          ),
        ],
      ),
      body: Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.9, // Adjust width as needed
          height: 400, // Adjust height as needed
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.5),
                spreadRadius: 5,
                blurRadius: 7,
                offset: Offset(0, 3), // changes position of shadow
              ),
            ],
          ),
          child: SfCalendar(
            view: CalendarView.week,
            dataSource: EventDataSource(appointments),
            timeSlotViewSettings: TimeSlotViewSettings(timeInterval: Duration(hours: 1)),
          ),
        ),
      ),
    );
  }

  void _showAddEventDialog(BuildContext context) {
    TextEditingController eventTitleController = TextEditingController();
    TextEditingController locationController = TextEditingController();
    TextEditingController descriptionController = TextEditingController();
    DateTime selectedDate = DateTime.now();
    TimeOfDay startTime = TimeOfDay.now();
    TimeOfDay endTime = TimeOfDay.now();
    List<String> selectedDays = [];

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Add New Event", style: TextStyle(fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: eventTitleController,
                  decoration: InputDecoration(
                    labelText: "Event Name",
                    border: OutlineInputBorder(),
                  ),
                ),
                SizedBox(height: 10),
                // Days selection with horizontal scrolling
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: ChoiceChip(
                          label: Text(day),
                          selected: selectedDays.contains(day),
                          onSelected: (bool selected) {
                            setState(() {
                              if (selected) {
                                selectedDays.add(day);
                              } else {
                                selectedDays.remove(day);
                              }
                            });
                          },
                        ),
                      );
                    }).toList(),
                  ),
                ),
                SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Text("Start Time"),
                          Row(
                            children: [
                              DropdownButton<int>(
                                value: startTime.hourOfPeriod,
                                items: List.generate(12, (index) => index + 1).map((int value) {
                                  return DropdownMenuItem<int>(
                                    value: value,
                                    child: Text(value.toString()),
                                  );
                                }).toList(),
                                onChanged: (newValue) {
                                  setState(() {
                                    startTime = startTime.replacing(hour: newValue ?? 0);
                                  });
                                },
                              ),
                              Text(":"),
                              DropdownButton<int>(
                                value: startTime.minute,
                                items: List.generate(60, (index) => index).map((int value) {
                                  return DropdownMenuItem<int>(
                                    value: value,
                                    child: Text(value.toString().padLeft(2, '0')),
                                  );
                                }).toList(),
                                onChanged: (newValue) {
                                  setState(() {
                                    startTime = startTime.replacing(minute: newValue ?? 0);
                                  });
                                },
                              ),
                              DropdownButton<String>(
                                value: startTime.period == DayPeriod.am ? "AM" : "PM",
                                items: ["AM", "PM"].map((String value) {
                                  return DropdownMenuItem<String>(
                                    value: value,
                                    child: Text(value),
                                  );
                                }).toList(),
                                onChanged: (newValue) {
                                  setState(() {
                                    startTime = startTime.replacing(
                                      hour: startTime.period == DayPeriod.am ? startTime.hour + 12 : startTime.hour - 12,
                                    );
                                  });
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        children: [
                          Text("End Time"),
                          Row(
                            children: [
                              DropdownButton<int>(
                                value: endTime.hourOfPeriod,
                                items: List.generate(12, (index) => index + 1).map((int value) {
                                  return DropdownMenuItem<int>(
                                    value: value,
                                    child: Text(value.toString()),
                                  );
                                }).toList(),
                                onChanged: (newValue) {
                                  setState(() {
                                    endTime = endTime.replacing(hour: newValue ?? 0);
                                  });
                                },
                              ),
                              Text(":"),
                              DropdownButton<int>(
                                value: endTime.minute,
                                items: List.generate(60, (index) => index).map((int value) {
                                  return DropdownMenuItem<int>(
                                    value: value,
                                    child: Text(value.toString().padLeft(2, '0')),
                                  );
                                }).toList(),
                                onChanged: (newValue) {
                                  setState(() {
                                    endTime = endTime.replacing(minute: newValue ?? 0);
                                  });
                                },
                              ),
                              DropdownButton<String>(
                                value: endTime.period == DayPeriod.am ? "AM" : "PM",
                                items: ["AM", "PM"].map((String value) {
                                  return DropdownMenuItem<String>(
                                    value: value,
                                    child: Text(value),
                                  );
                                }).toList(),
                                onChanged: (newValue) {
                                  setState(() {
                                    endTime = endTime.replacing(
                                      hour: endTime.period == DayPeriod.am ? endTime.hour + 12 : endTime.hour - 12,
                                    );
                                  });
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 10),
                TextField(
                  controller: locationController,
                  decoration: InputDecoration(
                    labelText: "Location",
                    border: OutlineInputBorder(),
                  ),
                ),
                SizedBox(height: 10),
                TextField(
                  controller: descriptionController,
                  decoration: InputDecoration(
                    labelText: "Description",
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
              child: Text("Cancel"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
              child: Text("Save"),
              onPressed: () {
                _addEvent(
                  eventTitleController.text,
                  locationController.text,
                  descriptionController.text,
                  selectedDate,
                  startTime,
                  endTime,
                  selectedDays,
                );
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  void _addEvent(
      String title,
      String location,
      String description,
      DateTime date,
      TimeOfDay startTime,
      TimeOfDay endTime, List<String> selectedDays,
      ) {
    final DateTime startDate = DateTime(date.year, date.month, date.day, startTime.hour, startTime.minute);
    final DateTime endDate = DateTime(date.year, date.month, date.day, endTime.hour, endTime.minute);

    setState(() {
      appointments.add(Appointment(
        startTime: startDate,
        endTime: endDate,
        subject: title,
        color: Colors.blue,
        notes: description,
        location: location,
      ));
    });
  }
}

class EventDataSource extends CalendarDataSource {
  EventDataSource(List<Appointment> appointments) {
    this.appointments = appointments;
  }
}
