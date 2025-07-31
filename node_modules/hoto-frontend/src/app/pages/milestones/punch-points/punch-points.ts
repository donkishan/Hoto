import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import flatpickr from 'flatpickr';
import { createIcons, icons } from 'lucide';
import { AuthService } from '../../../services/auth.service';
import { HttpHeaders } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-punch-points',
  imports: [RouterModule],
  templateUrl: './punch-points.html',
  styleUrl: './punch-points.css'
})
export class PunchPoints {

  private baseUrl = environment.apiUrl;
  private headers : HttpHeaders;  
  constructor(
    private router: Router,
    private authService : AuthService
  ) { 
    this.headers = this.authService.getAuthHeaders();
  }
    
  ngAfterViewInit() {
    flatpickr("[data-provider='flatpickr']", {
      dateFormat: "d-m-Y"
    });
    
    const table = $('#dataTable').DataTable({
      ordering: false,
      serverSide: true,
      processing: true,
      ajax: {
        url: `${this.baseUrl}/hoto-requests/requestDataTable`,
        type: 'GET',
        headers:this.authService.getRawAuthHeaders(),
        data: function (d: any) {
          d.project_type = $('#project_type').val();
          d.project_name = $('#project_name').val();
          d.cod_date = $('#cod_date').val();
          d.init_date = $('#init_date').val();
          d.initiated_by = $('#initiated_by').val();
          d.status = "submitted";
          return d;
        }
      },
      columnDefs: [
        {
          targets: [2,4,5,7],
          className: 'text-center'
        }
      ],
      columns: [
        { data: 'projectCode' },
        {  data: 'projectName' },
        {  data: 'capacity' },
        {  data: 'completionType' },
        {  data: 'codDate' },
        {  data: 'initiatedDate' },
        {  data: 'name' },          
      
        {
          title: 'Actions',
          data: '_id',
          render: function (id: string) {
            return `<button class="btn btn-sm btn-primary view-project" data-id="${id}">View</button>`;
          }
        }
      ]
    });

    // Event handlers after init
    $('#dataTable').on('click', '.view-project', (e: any) => {
      const id = $(e.currentTarget).data('id');
      this.navigateToBlockInfo(id);
    });

    // Render Lucide icons
    createIcons({ icons });
  }

  navigateToBlockInfo(id: string | number) {
    // Get the current route path
    const currentUrl = this.router.url;

    // Extract the base path (e.g., 'app/punch-points' or 'app/punch-points-project-team')
    const basePath = currentUrl.split('/block-information')[0]; // if already on a block-info page
    const cleanBase = basePath.includes('/block-information') ? basePath : currentUrl;

    // Navigate using the base path and block-information with ID
    this.router.navigate([`${cleanBase}/block-information`, id]);
  }
}
