import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../../interfaces/login.response.interface';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CommonModule 
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  currentYear = new Date().getFullYear();

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  username: string = '';
  password: string = '';

  loginFailed: boolean = false; 

  getLogin() {
   if (!this.username || !this.password) {
      alert('Email and Password are required.');
      return;
    }

    if (this.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    const body = {
      email: this.username,
      password: this.password
    };

    this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, body).subscribe({
      next: (res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('firstName', res.firstName);
        localStorage.setItem('email', res.email);
        localStorage.setItem('rolesId', res.rolesId);
        localStorage.setItem('divisionId', res.divisionId);
        localStorage.setItem('divisionCode', res.divisionCode);
        localStorage.setItem('divisionName', res.divisionName);
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        console.error('Login Failed', err);
        this.loginFailed = true;
      }
    });
  }
}
