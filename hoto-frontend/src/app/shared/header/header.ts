import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // ✅ Import this
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { IsDivisionPipe } from '../pipes/is-division-pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule,IsDivisionPipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(private authService: AuthService) {}
    
  username: string = '';
  divisionName: string = '';
  
  ngOnInit() {
    const storedUsername = localStorage.getItem('firstName');
    const storedDivision = localStorage.getItem('divisionName');
    this.username = storedUsername ? storedUsername : 'Guest';
    this.divisionName = storedDivision ? storedDivision : '';   
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
