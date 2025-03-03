import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DropdownComponent } from "./components/dropdown/dropdown.component";
import { NavigationComponent } from './components/navigation/navigation.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, DropdownComponent, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'guerilla-assessment';
}
