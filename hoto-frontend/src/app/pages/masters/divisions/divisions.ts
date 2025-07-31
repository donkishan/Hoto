import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-divisions',
  imports: [
    CommonModule 
  ],
  templateUrl: './divisions.html',
  styleUrl: './divisions.css'
})
export class Divisions {
  private baseUrl = environment.apiUrl;
  private authService = inject(AuthService);
  private accessToken = this.authService.getAccessToken();
  dataTable: any;

  ngAfterViewInit(): void {  
    this.dataTable = $('#dataTable').DataTable({
        "ordering": false,
        "serverSide": true,
        "processing": true,
        pagingType: 'full_numbers',
        ajax: {
          url:   `${this.baseUrl}/divisions/divisionDataTable`,
          type: 'GET',  
          headers: this.authService.getRawAuthHeaders(),        
        },
        fnDrawCallback: () => {
          $('[data-bs-toggle="tooltip"]').tooltip({
            boundary: 'window',
            container: 'body'
          });                        
        },
        columns: [
          { data: 'divisionCode' },
          { data: 'divisionName' }          
        ]
    });    
  }
}
