import { Routes } from '@angular/router';
import { KanbanComponent } from './components/kanban/kanban.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { MapComponent } from './components/map/map.component';


export const routes: Routes = [
    { path: 'kanban', component: KanbanComponent },
    { path: 'calendar', component: CalendarComponent },
    { path: 'map', component: MapComponent },
    { path: '', redirectTo: '/calendar', pathMatch: 'full' }
];
