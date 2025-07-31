import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, AfterViewInit, NgZone, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import flatpickr from "flatpickr";
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { IsDivisionPipe } from '../../../../shared/pipes/is-division-pipe';
import { AuthService } from '../../../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-block-information',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,IsDivisionPipe],
  templateUrl: './block-information.html',
  styleUrl: './block-information.css'
})

export class BlockInformation implements AfterViewInit {
  private baseUrl     = environment.apiUrl;
  private headers: HttpHeaders;
  
  hotoDetails         : any;
  blocks              : any[] = [];
  newMemberForm       !: FormGroup;
  members             : any[] = [];
  editMode            = false;
  editingMemberId     : string | null = null;
  dataTable           : any;
  dataTable1          : any;
  editMemberForm      !: FormGroup;
  assignedMembersMap  : { [blockId: string]: any[] } = {};
  isViewOnlyMode      : boolean = false;
  selectedBlockId     : string = '';
  selectedMemberId    : string = '';
  selectedBlock       : any = null;
  successMessage      = '';
  selectedProjectId   : string = '';
  hotoRequestId       : string = '';
  
  selectedIds: Set<string> = new Set();

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private http: HttpClient,
    private ngZone: NgZone,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
   }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.newMemberForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      role_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      deployed_date: ['']
    });

    if (id) {
        this.loadHotoRequest(id);

        const divisionId = localStorage.getItem('divisionId');

        this.dataTable = $('#dataTable').DataTable({
          serverSide: true,
          processing: true,
          responsive: true,
          ordering: false,
        
          ajax: {
            url: `${this.baseUrl}/block-information/datatable-members`,
            type: 'GET',
            headers:this.authService.getRawAuthHeaders(),
            data: (d:any) => {
              d.divisionId    = divisionId;
              d.projectId     = this.selectedProjectId;
              d.hotoRequestId = this.hotoRequestId;
              d.blockId       = this.selectedBlockId;
              d.status        = 'NOT_ASSIGNED';
            }
          },
          columns: [
            { data: 'checkbox' },
            { data: 'name' },
            { data: 'role_name' },
            { data: 'deployed_date' },
            { data: 'email' },
            { data: 'actions' }
          ],
          fnDrawCallback: () => {
            $('[data-bs-toggle="tooltip"]').tooltip({
              boundary: 'window',
              container: 'body'
            });   
            
            $('input[name="checked_id[]"]').off('change').on('change', (event: Event) => {
              const input = event.target as HTMLInputElement;
              const id = input.value;
              if (input.checked) {
                console.log("Checked: " + id);
                this.selectedIds.add(id);
              } else {
                console.log("Unchecked: " + id);
                this.selectedIds.delete(id);
              }
            });

            // Optional: Restore checked state for selected ones
            $('input[name="checked_id[]"]').each((_: number, el: HTMLInputElement) => {
              const id = el.value;
              el.checked = this.selectedIds.has(id);
            });
          },
        });
        
        $('#dataTable').on('click', '.edit-member', (event: any) => {
          const button = event.currentTarget;
          const userData = $(button).data('user');
          this.onEditMember(userData);
        });

        $('#dataTable').on('click', '.delete-member', (event: any) => {
          const button = event.currentTarget;
          const userId = $(button).data('id');
          this.bulkDelete(null, userId);
        });

        //assigned members
        this.dataTable1 = $('#dataTable1').DataTable({
          serverSide: true,
          processing: true,
          responsive: true,
          ordering: false,
        
          ajax: {
            url: `${this.baseUrl}/block-information/datatable-members`,
            type: 'GET',
            headers: this.authService.getRawAuthHeaders(),
            data: (d:any) => {
              d.divisionId    = divisionId;
              d.projectId     = this.selectedProjectId;
              d.hotoRequestId = this.hotoRequestId;
              d.blockId       = this.selectedBlockId;
              d.status        = 'ASSIGNED';
            }
          },
          columns: [
            { data: 'checkbox' },
            { data: 'name' },
            { data: 'role_name' },
            { data: 'deployed_date' },
            { data: 'email' },
            { data: 'actions' }
          ],
          fnDrawCallback: () => {
            $('[data-bs-toggle="tooltip"]').tooltip({
              boundary: 'window',
              container: 'body'
            });   
            
            $('input[name="checked_id1[]"]').off('change').on('change', (event: Event) => {
              const input = event.target as HTMLInputElement;
              const id = input.value;
              if (input.checked) {
                console.log("Checked: " + id);
                this.selectedIds.add(id);
              } else {
                console.log("Unchecked: " + id);
                this.selectedIds.delete(id);
              }
            });

            // Optional: Restore checked state for selected ones
            $('input[name="checked_id1[]"]').each((_: number, el: HTMLInputElement) => {
              const id = el.value;
              el.checked = this.selectedIds.has(id);
            });
          },
        });

        $('#dataTable1').on('click', '.remove-member', (event: any) => {
          const button = event.currentTarget;
          const userId = $(button).data('id');
          this.bulkRemove(null, userId);
        });

        (window as any).bulkAssignFromJQuery = (userId: string) => {
          this.ngZone.run(() => {
            this.bulkAssign(null , userId);
          });
        };
    } else {
      console.error('No ID found in route');
    }
  }

  loadHotoRequest(id: string): void {
    const divisionId = localStorage.getItem('divisionId');

    this.http.get<any>(`${this.baseUrl}/hoto-requests/division-wise/${id}/${divisionId}`, { headers:this.headers })
      .subscribe({
        next: (data) => {
          this.hotoDetails = data;
          this.blocks = data.blocks;
          this.selectedProjectId = this.hotoDetails.projectId;
          this.hotoRequestId = this.hotoDetails._id;
        },
        error: (err) => {
          console.error('Error loading HOTO request', err);
        }
      });
  }
  
  ngAfterViewInit(): void {
    const hotoId = this.route.snapshot.paramMap.get('id');
    const modal = document.getElementById('full-width-modal');
    if (modal && hotoId) {
      modal.addEventListener('hidden.bs.modal', () => {
        this.loadHotoRequest(hotoId);
      });
    }
 
    flatpickr("[data-provider='flatpickr']", {
      dateFormat: 'd-m-Y',
      defaultDate: new Date(),
      onChange: (dates: Date[], dateStr: string) => {
        this.newMemberForm.get('deployed_date')?.setValue(dateStr);
      }
    });
  }

  //open modal
  openAddMemberModal(blockId: string,isViewMode: boolean) {
    this.selectedBlock = this.blocks.find(b => b._id === blockId);
    this.selectedBlockId = blockId; 
    this.isViewOnlyMode = isViewMode;

    this.dataTable.ajax.reload();
    this.dataTable1.ajax.reload();
  }

  onAddNewMember() {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (this.newMemberForm.valid) {
      const formData = this.newMemberForm.value;
      
      const userPayload = {
        first_name : formData.name,
        email: formData.email,
        deployed_date: formData.deployed_date,        
        role_name: formData.role_name,
        division : this.authService.getDivision(),

      };
   

      if (this.editMode && this.editingMemberId) {
        this.http.put(`${this.baseUrl}/block-information/update-member/${this.editingMemberId}`, userPayload, { headers:this.headers })
          .subscribe({
            next: () => {
              this.successMessage = 'Member updated successfully!';
              this.newMemberForm.reset();
              this.editMode = false;
              this.editingMemberId = null;
              this.dataTable.ajax.reload(null, false);
              Swal.fire('Updated!', 'Member updated successfully!', 'success');
            },
            error: () => {
              Swal.fire('Error', 'Failed to update member.', 'error');
            }
          });
      } else {
        //Add Member
        this.http.post(`${this.baseUrl}/block-information/add-member`, userPayload, { headers:this.headers })
          .subscribe({
            next: (res: any) => {
              console.log(res.success);
              if(res.success){
                this.newMemberForm.reset();
                this.dataTable.ajax.reload(null, false);
                Swal.fire('Success', 'New member added!', 'success');
              }else{
                Swal.fire('Error', 'E-mail id already exist.', 'error');  
              }              
            },
            error: () => {
              Swal.fire('Error', 'Failed to add member.', 'error');
            }
          });
      }
    }
  }

  onEditMember(user: any) {
    this.editMode = true;
    this.editingMemberId = user._id;

    this.newMemberForm.patchValue({
      name: `${user.name}`,
      email: user.email,
      role_name: user.role_name,
      deployed_date: user.deployed_date,      
    });
  }
  
  toggleAll(event: any): void {
    const checked = event.target.checked;
    $('input[name="checked_id[]"]').prop('checked', checked).trigger('change');
  }

  toggleAll1(event: any): void {
    const checked = event.target.checked;
    $('input[name="checked_id1[]"]').prop('checked', checked).trigger('change');
  }

  bulkAssign(event: Event | null, assigned_user?: string): void {
    if (event) event.preventDefault();


    const blockId = this.selectedBlockId;
    const division = localStorage.getItem('divisionId');
    const userId = localStorage.getItem('userId');    
    let selectedUserIds: string[] = [];

    if (assigned_user) {
      // Single user assignment
      selectedUserIds = [assigned_user];
    } else {
      // Bulk assignment
      selectedUserIds = Array.from(this.selectedIds);
    }

    if (!blockId || selectedUserIds.length === 0) {
      Swal.fire('Error', 'Please select users and a valid block.', 'error');
      return;
    }

    const payload = {
      projectId: this.selectedProjectId,
      hotoRequestId: this.hotoDetails._id,
      block_id: blockId,
      users_id: selectedUserIds,
      division: division,
      userId : userId
    };

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to assign ${selectedUserIds.length} user(s) to this block.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Assign',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${this.baseUrl}/block-information/${blockId}/add-member`, payload, { headers:this.headers })
        .subscribe({
            next: () => {
              Swal.fire('Success', 'Users assigned successfully.', 'success');
              this.selectedIds.clear();
              this.dataTable.ajax.reload(null, false);
              this.dataTable1.ajax.reload(null, false);
            },
            error: () => {
              Swal.fire('Error', 'Failed to assign users.', 'error');
            }
        });
      }
    });
  }

  bulkDelete(event: Event | null, assigned_user?: string): void {
    if (event) event.preventDefault();

    const blockId = this.selectedBlockId;
    const division = localStorage.getItem('divisionId');
    const userId = localStorage.getItem('userId');
    
    let selectedUserIds: string[] = [];

    if (assigned_user) {
      // Single user assignment
      selectedUserIds = [assigned_user];
    } else {
      // Bulk assignment
      selectedUserIds = Array.from(this.selectedIds);
    }

    if (!blockId || selectedUserIds.length === 0) {
      Swal.fire('Error', 'Please select users and a valid block.', 'error');
      return;
    }

    const payload = {
      projectId: this.selectedProjectId,
      hotoRequestId: this.hotoDetails._id,
      block_id: blockId,
      users_id: selectedUserIds,
      division: division,
      userId : userId
    };

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedUserIds.length} user(s). If member assigned in another block it will be removed automatically.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${this.baseUrl}/block-information/${blockId}/delete-member`, payload, { headers:this.headers })
        .subscribe({
            next: () => {
              Swal.fire('Success', 'Users assigned successfully.', 'success');
              this.selectedIds.clear();
              this.dataTable.ajax.reload(null, false);
              this.dataTable1.ajax.reload(null, false);
            },
            error: () => {
              Swal.fire('Error', 'Failed to assign users.', 'error');
            }
        });
      }
    });
  }

  bulkRemove(event: Event | null, assigned_user?: string): void {
    if (event) event.preventDefault();
    const blockId = this.selectedBlockId;
    const division = localStorage.getItem('divisionId');
    const userId = localStorage.getItem('userId');
    let selectedUserIds: string[] = [];

    if (assigned_user) {
      // Single user assignment
      selectedUserIds = [assigned_user];
    } else {
      // Bulk assignment
      selectedUserIds = Array.from(this.selectedIds);
    }

    if (!blockId || selectedUserIds.length === 0) {
      Swal.fire('Error', 'Please select users and a valid block.', 'error');
      return;
    }

    const payload = {
      projectId: this.selectedProjectId,
      hotoRequestId: this.hotoDetails._id,
      block_id: blockId,
      users_id: selectedUserIds,
      division: division,
      userId : userId
    };

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to remove ${selectedUserIds.length} user(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove It',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${this.baseUrl}/block-information/${blockId}/remove-member`, payload, { headers:this.headers })
        .subscribe({
            next: () => {
              Swal.fire('Success', 'Users assigned successfully.', 'success');
              this.selectedIds.clear();
              this.dataTable.ajax.reload(null, false);
              this.dataTable1.ajax.reload(null, false);
            },
            error: () => {
              Swal.fire('Error', 'Failed to assign users.', 'error');
            }
        });
      }
    });
  }

  request_for_acknowledgement(blockId: string): void {
    const userId = localStorage.getItem('userId'); 
    const divisionId = localStorage.getItem('divisionId');
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to request for acknowledgement from project team.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Request',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(
        `${this.baseUrl}/block-information/${blockId}/request-acknowledgement`,
          { userId, divisionId }, 
          { headers:this.headers }
        ).subscribe({
          next: () => {
            Swal.fire('Success', 'Acknowledgement requested successfully.', 'success')
            .then(() => {
              location.reload();
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to request acknowledgement.', 'error');
          }
        });
      }
    });
  }

}
