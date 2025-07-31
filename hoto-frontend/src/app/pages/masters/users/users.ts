import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

declare var $: any;


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})

export class Users implements OnInit {

  private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;

  userForm!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  isEditMode = false;
  editingUserId: string | null = null;
  divisionList: any[] = [];
  rolesList: any[] = [];

  isSubmitting = false;
  
  @ViewChild('divisionSelect') divisionSelect!: ElementRef;
  @ViewChild('roleSelect') roleSelect!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]], 
      email: ['', [Validators.required, Validators.email]], 
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], 
      division: [null, Validators.required],
      role: [null, Validators.required], 
      profileImage: [null, Validators.required] 
    });

    this.fetchDivisions();

    const navState = history.state?.user;
    if (navState) {
      this.isEditMode = true;
      this.editingUserId = navState._id;
      this.userForm.patchValue(navState);

      this.fetchRolesByDivision(navState.division);

      setTimeout(() => {
        $(this.divisionSelect.nativeElement).val(navState.division).trigger('change');
        setTimeout(()=>{
          $(this.roleSelect.nativeElement).val(navState.role).trigger('change');
        },300);        
        this.previewUrl = navState.profileImage || null;
      }, 300);
    }
  }

  ngAfterViewInit(): void {
    $(this.divisionSelect.nativeElement).select2({
      placeholder: 'Select Division',
      allowClear: true,
      width: '100%'
    }).on('change', (e: any) => {
      const divisionId = e.target.value;
      this.userForm.get('division')?.setValue(divisionId);
      this.fetchRolesByDivision(divisionId);
    });

    $(this.roleSelect.nativeElement).select2({
      placeholder: 'Select Role',
      allowClear: true,
      width: '100%'
    }).on('change', (e: any) => {
      this.userForm.get('role')?.setValue(e.target.value);
    });
  }

  fetchDivisions(): void {
    this.http.get<any>(`${this.baseUrl}/divisions`, { headers:this.headers }).subscribe({
      next: (res) => {
        this.divisionList = res || [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to fetch divisions.', 'error');
      }
    });
  }

  fetchRolesByDivision(divisionId: string): void {
    if (!divisionId) {
      this.rolesList = [];
      setTimeout(() => {
        $(this.roleSelect.nativeElement).val('').trigger('change.select2');
      }, 100);
      return;
    }

    this.http.get<any>(`${this.baseUrl}/roles/byDivision/${divisionId}`, { headers:this.headers }).subscribe({
      next: (res) => {
        this.rolesList = res || [];
        this.userForm.get('role')?.setValue('');
        setTimeout(() => {
          $(this.roleSelect.nativeElement).val('').trigger('change.select2');
        }, 100);
      },
      error: () => {
        Swal.fire('Error', 'Failed to fetch roles for selected division.', 'error');
      }
    });
  }
  
  onSubmit(): void {
    if (this.userForm.invalid) {
      Swal.fire('Warning', 'Please fill all required fields correctly.', 'warning');
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.userForm.value,
      profileImage: this.previewUrl
    };

    if (this.isEditMode && this.editingUserId) {
      this.http.patch(`${this.baseUrl}/users/${this.editingUserId}`, formData, {headers:this.headers})
      .subscribe({
        next: () => {
          Swal.fire('Success', 'User updated successfully', 'success');
          this.router.navigate(['/app/users']);
        },
        error: () => {
          Swal.fire('Error', 'Failed to update user.', 'error');
        }
      });
    } else {
      this.http.post(`${this.baseUrl}/users`, formData, { headers:this.headers }).subscribe({
        next: () => {
          Swal.fire('Success', 'User created successfully', 'success');
          this.router.navigate(['/app/users']);
        },
        error: (err) => {
          const message = err?.error?.message || 'Failed to create user.';
          Swal.fire('Error', Array.isArray(message) ? message.join(', ') : message, 'error');
        }
      });
    }
    
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input?.files || input.files.length === 0) {
      Swal.fire('Error', 'No file selected.', 'error');
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      this.userForm.get('profileImage')?.setErrors({ invalidType: true });
      Swal.fire('Error', 'Only PNG, JPG, JPEG images are allowed.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.userForm.patchValue({ profileImage: file });
    this.userForm.get('profileImage')?.updateValueAndValidity();
  }

  resetForm(): void {
    this.userForm.reset();
    this.previewUrl = null;
    this.isEditMode = false;
    this.editingUserId = null;

    setTimeout(() => {
      $(this.divisionSelect.nativeElement).val('').trigger('change');
      $(this.roleSelect.nativeElement).val('').trigger('change');
    }, 100);
  }
}
