
import { Component, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './users-list.html',
  styleUrls: ['../users.css']
})
export class UserList implements AfterViewInit, OnDestroy {
  dataTable: any;
  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;
  private zone = inject(NgZone);

  constructor(
    private router: Router, 
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
  }

  ngAfterViewInit(): void {
    this.dataTable = $('#dataTable').DataTable({
      ordering: false,
      serverSide: true,
      processing: true,
      pagingType: 'full_numbers',
      ajax: {
        url: `${this.baseUrl}/users/userDataTable`,
        type: 'GET',
        headers: this.authService.getRawAuthHeaders(),    
      },
      columns: [
       { data: '_id' },
        { data: 'name' },
        { data: 'email' },
        { data: 'mobile' },
        { data: 'division' },
        { data: 'role_name' },
        {
          data: 'profileImage',
          render: (img: string) =>
            img ? `<img src="${img}" width="40" class="img-thumbnail">` : ''
        },
        {data: 'create_date'},
        {data: 'is_active'},
        {data: 'action'}  
      ],
      columnDefs: [
        {
          targets: [3,6,7,8,9], // index of the profileImage column
          className: 'text-center'
        }
      ],
      fnDrawCallback: () => {
        $('[data-bs-toggle="tooltip"]').tooltip({
          boundary: 'window',
          container: 'body'
        }); 
        
        $('.toggle-user').off('click').on('click', (event: any) => {
          var role_id = $(event.currentTarget).data('id');
          this.zone.run(() => this.onStatusChange(role_id)); // ✅ this.zone is accessible here
        });
      }
    });

    $('#dataTable tbody').on('click', '.edit-user', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.editUser(id);
    });

    $('#dataTable tbody').on('click', '.delete-user', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.confirmDelete(id);
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy(true);
    }
  }

  editUser(id: string): void {
    this.http.get<any>(`${this.baseUrl}/users/${id}`, {headers: this.headers})
    .subscribe({
      next: (user) => {
        this.router.navigate(['/app/users/create'], {
          state: { user }
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load user data.', 'error');
      }
    });
  }

  confirmDelete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/users/${id}`, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'User deleted successfully.', 'success');
            this.dataTable.ajax.reload(null, false);
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the user.', 'error');
          }
        });
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/app/users/create']);
  }
  
  onStatusChange(roleId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change status!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, do it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.patch(`${this.baseUrl}/users/${roleId}/toggle-status`, {}, { headers: this.headers })
        .subscribe({
          next: (res: any) => {
            Swal.fire('Success', 'Role status updated successfully', 'success');
            // Optionally refresh list here
             this.dataTable.ajax.reload(null, false);
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to update role status', 'error');
          }
        });       
      }
    });
    
    
  }
}
