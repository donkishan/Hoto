import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import flatpickr from "flatpickr";
import { createIcons, icons } from 'lucide';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { IsDivisionPipe } from '../../../shared/pipes/is-division-pipe';
declare var $: any;

@Component({
  selector: 'app-team-mobilisation',
  standalone: true,
  imports: [CommonModule, RouterModule,IsDivisionPipe],
  templateUrl: './team-mobilisation.html',
  styleUrls: ['./team-mobilisation.css']
})
export class TeamMobilisation implements AfterViewInit {
  constructor(
    private router: Router    
  ) { }

  private baseUrl = environment.apiUrl;

  private authService = inject(AuthService);
  private accessToken = this.authService.getAccessToken();
  private userEmail = this.authService.getEmail();
  
  navigateToBlockInfo(id: string | number) {
    const pipe = new IsDivisionPipe();
    const isAllowed = pipe.transform(['Project Team']);
    if(isAllowed){
      this.router.navigate(['/app/team-mobilisation/project-team', id]);
    }else{
      this.router.navigate(['/app/team-mobilisation/block-information', id]);
    }

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
        headers: {
          Authorization: this.accessToken || '',
          'x-user-email': this.userEmail || ''
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

    $('#filterForm').on('submit', (e: any) => {
      e.preventDefault();
      table.ajax.reload();
    });

    $('#clearFilters').on('click', () => {
      $('#filterForm')[0].reset();
      table.ajax.reload();
    });

    // Render Lucide icons
    createIcons({ icons });
  }
}
