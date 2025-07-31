import { CommonModule } from '@angular/common';
import { Component, inject, NgZone } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DivisionService } from '../../../services/division.service';
import { AuthService } from '../../../services/auth.service';

declare var $: any;

@Component({
  selector: 'app-roles',
  imports: [
    FormsModule,
    CommonModule 
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})

export class Roles {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private divisionService = inject(DivisionService);
  
  private headers: HttpHeaders;

  constructor(private authService: AuthService) {
    this.headers = this.authService.getAuthHeaders();
  }

  
  role_name: string = '';
  mst_divisions_id: string = '';
  roleId: string = '';
  isEditMode = false;

  validFailed: boolean = false; 

  saveRole(form: NgForm) {

    this.mst_divisions_id = $('#mst_divisions_id').val();

    if(!this.role_name || this.role_name.trim() === '' || this.role_name.length < 2) {
      alert('Role name is required and must be at least 2 characters long.');
      return;
    }

    if(!this.mst_divisions_id || this.mst_divisions_id.trim() === '') {
      alert('Please select division.');
      return;
    }
    const createdBy = localStorage.getItem('userId');

    const body = {
      role_name         : this.role_name,
      mst_divisions_id  : this.mst_divisions_id,
      'created_by'      : createdBy,
    };

    if (this.isEditMode && this.roleId) {
      this.http.put(`${this.baseUrl}/roles/${this.roleId}`, body, { headers: this.headers  }).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Role updated successfully.', 'success');
          form.resetForm();
          this.roleId = '';
          setTimeout(() => {
            $('#mst_divisions_id').val(null).trigger('change');
          }, 0);
          this.isEditMode = false;
          this.dataTable.ajax.reload(null, false);
        },
        error: () => {
          Swal.fire('Error!', 'Failed to update the role.', 'error');
        }
      });      
    }else{
      this.http.post(`${this.baseUrl}/roles`, body,{ headers: this.headers }).subscribe({
        next: (res) => {
          form.resetForm();
          setTimeout(() => {
            $('#mst_divisions_id').val(null).trigger('change');
          }, 0);
          Swal.fire({
            icon: 'success',
            title: 'Role Saved!',
            text: 'The role has been successfully stored.',          
            confirmButtonColor: '#3085d6'
          });

          this.dataTable.ajax.reload(null, false);
        }   ,
        error: (err) => {
          console.error('Error creating role:', err);
          if (err.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Role name already exists.',
              confirmButtonColor: '#d33'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to save the role.',
              confirmButtonColor: '#d33'
            });
          }
        } 
      });           
    }
  }

  dataTable: any;
  ngAfterViewInit(): void {
    this.dataTable = $('#dataTable').DataTable({
        "ordering": false,
        "serverSide": true,
        "processing": true,
        pagingType: 'full_numbers',
        ajax: {
          url:   `${this.baseUrl}/roles`,
          type: 'GET',  
          headers: this.authService.getRawAuthHeaders(),        
        },
        columnDefs: [
          {
            targets: [3,4,5],
            className: 'text-center'
          }
        ],
        fnDrawCallback: () => {
          $('[data-bs-toggle="tooltip"]').tooltip({
            boundary: 'window',
            container: 'body'
          });          
          
          $('.edit-role').off('click').on('click', (event: any) => {
            var role_id = $(event.currentTarget).data('id');
            var division_id = $(event.currentTarget).data('division_id');
            this.zone.run(() => this.onEditRole(role_id,division_id)); // ✅ this.zone is accessible here
          });

          $('.delete-role').off('click').on('click', (event: any) => {
            var role_id = $(event.currentTarget).data('id');
            this.zone.run(() => this.onDeleteRole(role_id)); // ✅ this.zone is accessible here
          });

          $('.toggle-role').off('click').on('click', (event: any) => {
            var role_id = $(event.currentTarget).data('id');
            this.zone.run(() => this.onStatusChange(role_id)); // ✅ this.zone is accessible here
          });

        },
        columns: [
          { data: '_id' },
          { data: 'division' },
          { data: 'role_name' },
          { data: 'is_active' },
          { data: 'create_date' },
          { data: 'actions' },
        ]
    });
    
    this.divisionService.getDivisions().subscribe({
      next: (data) => {
        const select = $('#mst_divisions_id');
        select.empty();
        select.append(`<option value="">Select Division</option>`);
        data.forEach((item: any) => {
          select.append(`<option value="${item._id}">${item.divisionCode} - ${item.divisionName}</option>`);
        });
        select.select2();
      },
      error: (err) => {
        console.error('Failed to load divisions', err);
      }
    });
  }

  onEditRole(roleId: string,divisionId :string) {
    
    this.http.get(`${this.baseUrl}/roles/${roleId}`, { headers : this.headers }).subscribe({
      next: (data: any) => {
        this.role_name = data.role_name;
        this.roleId = roleId;
        this.mst_divisions_id = data.mst_divisions_id;
        this.isEditMode = true;

        setTimeout(() => {
          $('#mst_divisions_id').val(data.mst_divisions_id).trigger('change');
        }, 0);
      },
      error: (error) => console.error('Failed to load role:', error)
    });
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
        this.http.patch(`${this.baseUrl}/roles/${roleId}/toggle-status`, {}, { headers : this.headers })
        .subscribe({
          next: (res: any) => {
            Swal.fire('Success', 'Role status updated successfully', 'success');
            // Optionally refresh list here
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to update role status', 'error');
          }
        });
        this.dataTable.ajax.reload(null, false);
      }
    });
    
    
  }

  onDeleteRole(roleId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this role? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, do it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/roles/${roleId}`, { headers : this.headers })
        .subscribe({
          next: (res: any) => {
            Swal.fire('Success', 'Role deleted successfully', 'success');
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
  
  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy(true);
    }
  }  
}


 