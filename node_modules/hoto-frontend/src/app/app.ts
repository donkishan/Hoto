import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './shared/topbar/topbar';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Roles } from './pages/masters/roles/roles';
import { Divisions } from './pages/masters/divisions/divisions';
import { Users } from './pages/masters/users/users';
import { FormsModule } from '@angular/forms';
import { SessionTimeoutService } from './services/session-timeout.service';
import { Title } from '@angular/platform-browser';
import { environment } from './environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    Topbar,
    Header,
    Footer,
    Roles,
    Divisions,
    Users
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  showLayout = true;
  
  constructor(
    private router: Router,
    private sessionTimeout: SessionTimeoutService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showLayout = event.urlAfterRedirects !== '/';
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        const appName = environment.appName;
        const title = data['title'] || appName;
        this.titleService.setTitle(`${title} - ${appName}`);
      });

    const sessionExpired = localStorage.getItem('session_expired');
    if (sessionExpired === 'true') {
      localStorage.removeItem('session_expired');
      if (this.router.url !== '/') {
        this.router.navigate(['/']);
      }
    }
  }

}
