import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  constructor(private authService: AuthService) {}
  
  username: string = '';
  ngOnInit() {
    const storedUsername = localStorage.getItem('firstName');
    this.username = storedUsername ? storedUsername : 'Guest';
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        
        this.authService.logout();
      }
    });
  }

}
