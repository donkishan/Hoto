import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private timeoutInMs = 24 * 60 * 60 *  1000; // 5 minutes
  private timeoutId: any;

  constructor(private router: Router, private zone: NgZone) {
    this.initListener();
    this.resetTimeout();
  }

  private initListener() {
    window.addEventListener('mousemove', () => this.resetTimeout());
    window.addEventListener('keydown', () => this.resetTimeout());
    window.addEventListener('click', () => this.resetTimeout());
    window.addEventListener('scroll', () => this.resetTimeout());
  }

  private resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.zone.run(() => this.handleSessionExpired());
    }, this.timeoutInMs);
  }

  private handleSessionExpired() {
    if (this.router.url === '/') {
      return;
    }

    localStorage.clear();
    localStorage.setItem('session_expired', 'true'); // ✅ flag

    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'You have been logged out due to inactivity.',
      confirmButtonText: 'Login Again',
      allowOutsideClick: false
    }).then(() => {
      this.router.navigate(['/']);
    });
  }
}
