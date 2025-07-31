import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import flatpickr from 'flatpickr';
import { createIcons, icons } from 'lucide';
declare var $: any;
@Component({
  selector: 'app-site-readiness',
  imports: [RouterModule, CommonModule],
  templateUrl: './site-readiness.html',
  styleUrl: './site-readiness.css'
})
 
export class SiteReadiness {
  private baseUrl = environment.apiUrl;

  constructor(
    private router: Router    
  ) { }
    
  ngAfterViewInit() {
    flatpickr("[data-provider='flatpickr']", {
      dateFormat: "d-m-Y"
    });

    const token = localStorage.getItem('accessToken');

      const table = $('#dataTable').DataTable({
        ordering: false,
        serverSide: true,
        processing: true,
        ajax: {
          url: `${this.baseUrl}/hoto-requests/requestDataTable`,
          type: 'GET',
          beforeSend: function (xhr: any) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          },
         
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
    this.router.navigate(['/app/site-readiness/block-information', id]);
  }
}
