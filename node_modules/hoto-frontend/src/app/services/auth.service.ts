import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private baseUrl = environment.apiUrl;
    private router = inject(Router);

    constructor(private http: HttpClient) {}
    
    getAccessToken(): string {
        const token =  localStorage.getItem('accessToken') || '';
        return `Bearer ${token}`
    }

    getEmail(): string {
        const email =  localStorage.getItem('email') || '';
        return email;
    }

    getRoles(): string{
        const rolesId = localStorage.getItem('rolesId') || '';
        return rolesId;
    }

    getUser(): string{
        const userId = localStorage.getItem('userId') || '';
        return userId;
    }

    getDivision(): string{
        const divisionId = localStorage.getItem('divisionId') || '';
        return divisionId;
    }

    getRefreshToken(): string {
        return localStorage.getItem('refreshToken') || '';
    }
    getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken') || '';
        const userEmail = localStorage.getItem('userEmail') || '';
        const userId = localStorage.getItem('userId') || '';

        return new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'x-user-email': userEmail,
        'x-user-id': userId
        });
    }

    getRawAuthHeaders(): { [header: string]: string } {
        const token = localStorage.getItem('accessToken') || '';
        const userEmail = localStorage.getItem('userEmail') || '';
        const userId = localStorage.getItem('userId') || '';
        return {
            Authorization: `Bearer ${token}`,
            'x-user-email': userEmail,
            'x-user-id': userId
        };
    }

    async refreshAccessToken(): Promise<string> {
        const refreshToken = this.getRefreshToken();

        const response: any = await firstValueFrom(
            this.http.post(`${this.baseUrl}/auth/refresh`, { refreshToken: refreshToken })
        );

        const newAccessToken = response.accessToken;
        const newRefreshToken = response.refreshToken;


        if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
        }

        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        return newAccessToken;
    }

    logout(): void {
        localStorage.clear();
        this.router.navigate(['/']);
    }
}
