import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import { JobSchedule } from '../../models/job-schedule';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  schedules: JobSchedule[] = [];
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
  currentView: string = 'timeGridWeek';
  currentDateRange: string = '';
  isDropdownOpen = false;
  searchTerm: string = '';
  isPersonDropdownOpen: boolean = false;
  isFilterDropdownOpen: boolean = false;
  selectedPerson: string | null = null;
  selectedFilters: string[] = [];
  availableEmployees: string[] = [];
  availablePositions: string[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    allDaySlot: false,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    headerToolbar: false,
    nowIndicator: true,
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    dayHeaderContent: (arg) => {
      return {
        html: `${arg.date.toLocaleString('en-US', { weekday: 'short' })} ${arg.date.getDate()}`
      }
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventContent: (arg) => {
      return {
        html: `
          <div class="text-gray-800 font-medium text-sm truncate p-0">
            ${arg.event.title}
          </div>
        `
      }
    }
  };

  get calendar() {
    return this.calendarComponent?.getApi();
  }


  constructor(private http: HttpClient) { }

  ngOnInit() {
    setTimeout(() => {
      if (this.calendar) {
        this.updateDateRange();
      }
    });

    this.http.get<{ schedules: JobSchedule[] }>('schedules.json').subscribe(data => {
      this.schedules = data.schedules;
      this.calendarOptions.events = this.schedules.map(schedule => ({
        id: schedule.id,
        title: `${schedule.address}`,
        start: schedule.scheduleTime.start,
        end: schedule.scheduleTime.end,
        backgroundColor: schedule.color,
        extendedProps: {
          position: schedule.position
        }
      }));
    });
    this.http.get<{ schedules: JobSchedule[] }>('schedules.json').subscribe(data => {
      this.schedules = data.schedules;
      // Extract unique employees and positions
      this.availableEmployees = [...new Set(data.schedules.map(s => s.employeeName))];
      this.availablePositions = [...new Set(data.schedules.map(s => s.position))];
      // ... rest of the existing code
    });
  }
  // Add these methods
  handleSearch(event: any) {
    this.searchTerm = event.target.value;
    this.filterEvents();
  }

  handlePersonSelect(person: string) {
    this.selectedPerson = person;
    this.isPersonDropdownOpen = false;
    this.filterEvents();
  }

  handleFilterSelect(filter: string) {
    const index = this.selectedFilters.indexOf(filter);
    if (index > -1) {
      this.selectedFilters.splice(index, 1);
    } else {
      this.selectedFilters.push(filter);
    }
    this.filterEvents();
  }

  private filterEvents() {
    if (this.calendar) {
      const filteredEvents = this.schedules
        .filter(schedule => {
          const searchTermLower = this.searchTerm.toLowerCase();
          const matchesSearch = !this.searchTerm ||
            schedule.address.toLowerCase().includes(searchTermLower) ||
            schedule.employeeName.toLowerCase().includes(searchTermLower) ||
            schedule.position.toLowerCase().includes(searchTermLower) ||
            schedule.date.toLowerCase().includes(searchTermLower);

          const matchesPerson = !this.selectedPerson ||
            schedule.employeeName === this.selectedPerson;

          const matchesFilters = this.selectedFilters.length === 0 ||
            this.selectedFilters.includes(schedule.position);

          return matchesSearch && matchesPerson && matchesFilters;
        })
        .map(schedule => ({
          id: schedule.id,
          title: `${schedule.address}`,
          start: schedule.scheduleTime.start,
          end: schedule.scheduleTime.end,
          backgroundColor: schedule.color,
          extendedProps: {
            position: schedule.position,
            employeeName: schedule.employeeName
          }
        }));

      this.calendar.removeAllEvents();
      this.calendar.addEventSource(filteredEvents);
    }
  }

  handleViewChange(viewType: string) {
    if (this.calendar) {
      this.calendar.changeView(viewType);
      this.currentView = viewType;
      this.updateDateRange();
    }
  }

  updateDateRange() {
    const calendarApi = this.calendar;
    if (calendarApi) {
      const start = calendarApi.view.currentStart;
      const end = calendarApi.view.currentEnd;

      const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      const formatDate = (date: Date) => {
        const day = date.getDate();
        return `${day}${getOrdinalSuffix(day)} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
      };

      this.currentDateRange = `${formatDate(start)} - ${formatDate(end)}`;
    }
  }

  handleNext() {
    if (this.calendar) {
      this.calendar.next();
      this.updateDateRange();
    }
  }

  handlePrev() {
    if (this.calendar) {
      this.calendar.prev();
      this.updateDateRange();
    }
  }

  handleToday() {
    if (this.calendar) {
      this.calendar.today();
      this.updateDateRange();
    }
  }

  handleEventClick(info: any) {
    const event = info.event;
    alert(`
      Address: ${event.title}
      Position: ${event.extendedProps.position}
      Time: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}
    `);
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedPerson = null;
    this.selectedFilters = [];
    this.isPersonDropdownOpen = false;
    this.isFilterDropdownOpen = false;

    // Reset events to original state
    if (this.calendar) {
      this.calendar.removeAllEvents();
      this.calendar.addEventSource(this.schedules.map(schedule => ({
        id: schedule.id,
        title: `${schedule.address}`,
        start: schedule.scheduleTime.start,
        end: schedule.scheduleTime.end,
        backgroundColor: schedule.color,
        extendedProps: {
          position: schedule.position,
          employeeName: schedule.employeeName
        }
      })));
    }
  }
}