// src/app/pages/hoto-requests/hoto-requests.ts
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; 
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { openSecureFile } from '../../shared/utils/file-utils';
import { AuthService } from '../../services/auth.service';
declare var flatpickr: any;
declare var bootstrap: any;
declare var $: any;


interface Block {
  name: string;
  capacity: string;
  startDate: string;
  endDate: string;
  remarks: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
  capacity: string;
}

@Component({
  selector: 'app-hoto-requests',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule, RouterModule ],
  templateUrl: './hoto-requests.html',
  styleUrls: ['./hoto-requests.css']
})

export class HotoRequests implements AfterViewInit {
  
  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
  } 


  users: any[] = [];

  formData: any = {
    projectId             : '',
    projectCode           : '',
    capacity              : '',
    completionType        : '',
    initiatedDate         : '',
    initiatedById         : '',
    codDate               : '',
    certificateFileName   : '',
    certificateUrl        : '',
    hotoCapacity          : '',
    hotoFor               : ''
  };

  newBlock: Block = {
    name      : '',
    capacity  : '',
    startDate : '',
    endDate   : '',
    remarks   : ''
  };
  
  selectedFile      : File | null = null;
  blocks            : any[] = [];
  editingId         : string | null = null;
  editingBlockIndex : number | null = null;
  projectList       : Project[] = [];

  @ViewChild('projectSelect') projectSelect     !: ElementRef;
  @ViewChild('completionSelect') completionSelect !: ElementRef;
  @ViewChild('initiatedBy') initiatedBy         !: ElementRef;
  @ViewChild('hotoForSelect') hotoForSelect     !: ElementRef;


  ngOnInit(): void {
    this.fetchProjects();
    this.fetchUsers(); 

    const state = history.state;

    if (state?.hotoRequest) {
      this.editingId = state.hotoRequest._id;
      const hoto = state.hotoRequest;

      this.formData = {
        projectId       : hoto.projectId,
        projectCode     : hoto.projectCode,
        capacity        : hoto.capacity,        
        completionType  : hoto.completionType,        
        initiatedDate   : hoto.initiatedDate,
        initiatedById   : hoto.initiatedById,
        codDate         : hoto.codDate,
        hotoFor         : hoto.hotoFor,
        hotoCapacity    : hoto.hotoCapacity,
      };
      
      this.formData.certificateFileName = hoto.certificatePath?.split('\\').pop() || '';

      this.formData.certificateUrl = hoto.certificatePath.replace(/^uploads[\\/]/, '');
      
      this.selectedFile = null;
      this.editingId = hoto._id;
      this.blocks = Array.isArray(hoto.blocks) ? hoto.blocks : [];

      setTimeout(() => {
        if (this.formData.completionType) {
          const selectPType = $(this.completionSelect.nativeElement);
          selectPType.val(this.formData.completionType).trigger('change');
        }
      }, 0);

      setTimeout(() => {
        if (this.formData.hotoFor) {
          const selectPType = $(this.hotoForSelect.nativeElement);
          selectPType.val(this.formData.hotoFor).trigger('change');
        }
      }, 0);
      
    } else {
      const saved = localStorage.getItem('hotoFormData');
      if (saved) {
        const parsed = JSON.parse(saved);        
        this.blocks = parsed.blocks || [];
      }
    }
  }

  ngAfterViewInit(): void {
    const selectEl = $(this.projectSelect.nativeElement);
    selectEl.select2();
    selectEl.on('change', (event: any) => {
      const selectedId = event.target.value;
      this.formData.projectId = selectedId; 

      const project = this.projectList.find(p => p.id == selectedId);

      if (project) {
        this.formData.projectCode = project.code;
        this.formData.capacity = project.capacity;
      } else {
        this.formData.projectCode = '';
        this.formData.capacity = '';
      }
    });

    const selectPType = $(this.completionSelect.nativeElement);
    selectPType.select2();
    selectPType.on('change',(event: any)=>{
      this.formData.completionType = event.target.value;
    });

    const selectIBy = $(this.initiatedBy.nativeElement);    
    selectIBy.select2();
    selectIBy.on('change',(event:any)=>{
      this.formData.initiatedById = event.target.value;
    });

    const hotoFor = $(this.hotoForSelect.nativeElement);
    hotoFor.select2();
    hotoFor.on('change',(event: any)=>{
      this.formData.hotoFor = event.target.value;
      this.onHotoForChange();
    });
         
    flatpickr('#declarationDateInput', {
      dateFormat: 'd-m-Y',
      onChange: (dates: Date[], dateStr: string) => {
        this.formData.initiatedDate = dateStr;
      }
    });

    flatpickr('#codDateInput', {
      dateFormat: 'd-m-Y',
      onChange: (dates: Date[], dateStr: string) => {
        this.formData.codDate = dateStr;
      }
    });
     
    flatpickr('#startDateInput', {
      dateFormat: 'd-m-Y',
      onChange: (dates: Date[], dateStr: string) => {
        this.newBlock.startDate = dateStr;
      }
    });

    flatpickr('#endDateInput', {
      dateFormat: 'd-m-Y',
      onChange: (dates: Date[], dateStr: string) => {
        this.newBlock.endDate = dateStr;
      }
    });
  }

  onHotoForChange() {
    if (this.formData.hotoFor === 'FULL_PROJECT') {      
      this.formData.hotoCapacity = this.formData.capacity;
    } else {
      this.formData.hotoCapacity = ''; 
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  openBlockModal(): void {
    const modalEl = document.getElementById('blockModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      setTimeout(() => {
        flatpickr('#startDateInput', { dateFormat: 'd-m-Y' });
        flatpickr('#endDateInput', { dateFormat: 'd-m-Y' });
      }, 100); // wait until modal content is visible
    }
  }

  fetchUsers(): void {
    this.http.get<any>(`${this.baseUrl}/users`, {
      headers: this.headers
    }).subscribe({
      next: (res) => {
        this.users = res || []; 
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        Swal.fire('Error', 'Failed to fetch users.', 'error');
      }
    });
  }

  fetchProjects(): void {
    this.http.get<any>(`${this.baseUrl}/projects`, {
      headers: this.headers
    }).subscribe({
      next: (data) => {
        const array = Array.isArray(data) ? data : (data.data || []);
        this.projectList = array.map((proj: any) => ({
          id: proj._id,
          code: proj.projectId,
          name: proj.projectName,
          capacity: proj.plantPower || ''
        }));
      },
      error: (err) => {
        console.error('Failed to fetch projects:', err);
        Swal.fire('Error', 'Could not fetch project list.', 'error');
      }
    });
  }

  submitForm(status: 'draft' | 'submitted'): void {
    const isEditMode = !!this.editingId;

    const cleanedBlocks = Array.isArray(this.blocks)
      ? this.blocks.map((block) => {
          const { createdAt, updatedAt, __v, ...rest } = block;
          const cleaned = { ...rest };
          if (!block._id || block._id.length !== 24) delete cleaned._id;
          return cleaned;
        })
      : [];

    const payload = {
      ...this.formData,
      status
    };

    console.log(payload);
    const formDataToSend = new FormData();
    formDataToSend.append('formData', JSON.stringify(payload));
    formDataToSend.append('blocks', JSON.stringify(cleanedBlocks));

    if (this.selectedFile) {
      formDataToSend.append('certificate', this.selectedFile); // optional file
    }

    const url = isEditMode
      ? `${this.baseUrl}/hoto-requests/${this.editingId}`
      : `${this.baseUrl}/hoto-requests`;

    const method = isEditMode ? 'PATCH' : 'POST';

    if (isEditMode && !this.editingId) {
      Swal.fire('Error', 'Missing HOTO ID for update. Please reload the page.', 'error');
      return;
    }

    localStorage.setItem('hotoFormData', JSON.stringify({
      ...this.formData,
      status,
      blocks: this.blocks
    }));

    this.http.request(method, url, {
      body: formDataToSend,
      headers: this.headers,
      responseType: 'text'
    }).subscribe({
      next: () => {
        Swal.fire(
          'Success!',
          `HOTO request ${status === 'draft' ? 'saved as draft' : 'submitted'} successfully!`,
          'success'
        ).then(() => {
          this.router.navigate(['/app/hoto-requests']);
        });
        localStorage.removeItem('hotoFormData');
        this.resetForm(); // custom method to reset everything

      },
      error: (error) => {
        console.error('Error submitting HOTO request:', error);
        Swal.fire(
          'Error',
          `Failed to ${status === 'draft' ? 'save draft' : 'submit'} HOTO request.`,
          'error'
        );
      }
    });
  }

  resetForm(): void {
    this.formData = {
      projectId: '',
      projectName: '',
      completionType: '',
      initiatedDate: '',
      initiatedBy: '',
      initiatedById: '',
      capacity: '',
      codDate: '',
      status: ''
    };
    this.blocks = [];
    this.selectedFile = null;
    this.editingId = null;
    localStorage.removeItem('hotoFormData');
  }
    
  onInitiatedByChange(event: any): void {
    const selectedUserId = event.target.value;
    const user = this.users.find((u: any) => u._id === selectedUserId);

    if (user) {
      this.formData.initiatedBy = user.name;
      this.formData.initiatedById = user._id;
    } else {
      this.formData.initiatedBy = '';
      this.formData.initiatedById = '';
    }
  }
  
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  saveBlock(): void {
    const blockCapacity = Number(this.newBlock.capacity);
    const formCapacity = Number(this.formData.hotoCapacity);

    const totalCapacity = this.blocks.reduce((sum, block, index) => {
      if (this.editingBlockIndex !== null && index === this.editingBlockIndex) {
        return sum; 
      }
      return sum + Number(block.capacity);
    }, 0);

    const finalTotalCapacity = totalCapacity + blockCapacity;

    if (blockCapacity <= 0 || finalTotalCapacity > formCapacity) {
      Swal.fire(
        'Error',
        `Block capacity must be greater than 0 and HOTO  capacity of all blocks must not exceed ${formCapacity}.`,
        'error'
      );
      return;
    }

    if (this.newBlock.name && this.newBlock.capacity && this.newBlock.startDate && this.newBlock.endDate) {

      const startDate = this.parseDate(this.newBlock.startDate);
      const endDate = this.parseDate(this.newBlock.endDate);

      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        Swal.fire('Error', 'Invalid date format.', 'error');
        return;
      }

      if (endDate <= startDate) {
        Swal.fire(
          'Error',
          'End date must be greater than start date.',
          'error'
        );
        return;
      }

      if (this.editingBlockIndex !== null) {
        this.blocks[this.editingBlockIndex] = { ...this.newBlock };
        this.editingBlockIndex = null;
      } else {
        this.blocks.push({ ...this.newBlock });
      }

      this.newBlock = {
        name: '',
        capacity: '',
        startDate: '',
        endDate: '',
        remarks: ''
      };

      const updated = {
        ...this.formData,
        blocks: this.blocks
      };
      localStorage.setItem('hotoFormData', JSON.stringify(updated));

      const modalEl = document.getElementById('blockModal');
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
      }
    } else {
      Swal.fire('Error', 'Please fill all required block fields.', 'error');
    }
  }

  editBlock(index: number): void {
    const block = this.blocks[index];
    this.newBlock = { ...block };
    this.editingBlockIndex = index;

    const modalEl = document.getElementById('blockModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      setTimeout(() => {
        flatpickr('#startDateInput', {
          dateFormat: 'd-m-Y',
          defaultDate: block.startDate
        });
        flatpickr('#endDateInput', {
          dateFormat: 'd-m-Y',
          defaultDate: block.endDate
        });
      }, 100);
    }
  }

  deleteBlock(index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this block?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blocks.splice(index, 1);

        const updated = {
          ...this.formData,
          blocks: this.blocks
        };
        localStorage.setItem('hotoFormData', JSON.stringify(updated));

        Swal.fire(
          'Deleted!',
          'Block deleted successfully.',
          'success'
        );
      }
    });
  }

  viewFile(filePath: string) {
    openSecureFile(filePath, 'view'); 
  }
}