
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';
import flatpickr from 'flatpickr';

declare const $: any; 

@Component({
  selector: 'app-view-project',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterModule  ], 
  templateUrl: './view-project.html',
  styleUrl: './view-project.css'
})
export class ViewProject {
private baseUrl = environment.apiUrl;
  private headers: HttpHeaders;

  projectForm!: FormGroup;
  pvSystemForm!: FormGroup;

  projects: any[] = [];
  isEditMode = false;
  editingProjectId: string | null = null;

  countries: any[] = [];
  timezones: string[] = [];
  regions: { code: string; name: string; subdivision: string | null }[] = [];

  filteredStates: string[] = [];

  pvSystemList: any[] = [];
  editPVIndex: number | null = null;

  @ViewChild('countrySelect') countrySelect!: ElementRef;
  @ViewChild('timezoneSelect') timezoneSelect!: ElementRef;
  @ViewChild('regionSelect') regionSelect!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.headers = this.authService.getAuthHeaders();
  }

  async ngOnInit(): Promise<void> {
    this.initForms();
    this.fetchProjects();

    await this.loadCountries();

    const state = history.state;
    if (state?.project) {
      this.editingProjectId = state.project._id;
      this.projectForm.patchValue(state.project);
    

      if (Array.isArray(state.project.pvConfigurations)) {
        this.pvSystemList = [...state.project.pvConfigurations];
      }

      this.isEditMode = true;

      setTimeout(() => {
        $(this.countrySelect.nativeElement)
          .val(state.project.country)
          .trigger('change.select2');
      }, 0);

      this.onCountryChangeEvent({
        target: { value: state.project.country }
      } as any);
    }
  }

  //fetching countries
  loadCountries(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any[]>(`${this.baseUrl}/countries`, { headers:this.headers }).subscribe({
        next: (res) => {
          this.countries = res;
          setTimeout(() => {
            $(this.countrySelect.nativeElement).trigger('change.select2');
          }, 0);
          resolve(); // 🔁 resolves async ngOnInit
        },
        error: () => {
          console.error('Failed to load countries.');
          resolve(); // Still resolve to avoid blocking
        }
      });
    });
  }

  initForms() {
    this.projectForm = this.fb.group({
      projectId: ['', Validators.required],
      spvName: ['', Validators.required],
      projectName: ['', Validators.required],
      coordinates: ['', Validators.required],
      region: ['', Validators.required],
      country: ['', Validators.required],
      timezone: ['', Validators.required],
      plantPower: ['', Validators.required],
      googleEarth: ['', Validators.required],
      constructionStart: ['', Validators.required],
      commissioning: ['', Validators.required],
      siteDescription: ['', Validators.required],
      globalProject: ['', Validators.required],
      ratedCapacityDC: ['', Validators.required],
      ratedCapacityAC: ['', Validators.required],
      dcAcRatio: ['', Validators.required],
      orientation: ['', Validators.required],
      rowSpacing: ['', Validators.required],
      height: ['', Validators.required],
      gcr: ['', Validators.required],
      areaLimitations: ['', Validators.required],
      modulesPerString: ['', Validators.required],
      stringsPerInverter: ['', Validators.required],
      pnomRatio: ['', Validators.required],
      cleaningEvent: ['', Validators.required],
      roboticCleaning: ['', Validators.required],
    }); 
    // Disable all fields
      this.projectForm.disable();


    this.pvSystemForm = this.fb.group({
      solarModule: ['', Validators.required],
      solarPower: ['', Validators.required],
      solarCount: ['', Validators.required],
      inverter: ['', Validators.required],
      inverterPower: ['', Validators.required],
      inverterCount: ['', Validators.required],
      installationType: ['', Validators.required],
      trackingSystem: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    $(this.countrySelect.nativeElement).select2();
    $(this.countrySelect.nativeElement).on('change', (e: any) => {
      this.onCountryChangeEvent(e);
    });

    $(this.timezoneSelect.nativeElement).select2();
    $(this.timezoneSelect.nativeElement).on('change', (e: any) => {
      const selectedValue = $(e.target).val();
      this.projectForm.get('timezone')?.setValue(selectedValue);
      this.projectForm.get('timezone')?.markAsTouched();
      this.projectForm.get('timezone')?.markAsDirty();
    });

    $(this.regionSelect.nativeElement).select2();
    $(this.regionSelect.nativeElement).on('change', (e: any) => {
      const selectedValue = $(e.target).val();
      this.projectForm.get('region')?.setValue(selectedValue);
      this.projectForm.get('region')?.markAsTouched();
      this.projectForm.get('region')?.markAsDirty();
    });


    flatpickr('#commissioningInput', {
      dateFormat: 'd-m-Y',
      onChange: (selectedDates: Date[], dateStr: string) => {
        this.projectForm.patchValue({ commissioning: dateStr });
      }
    });
  }

  pvFieldMap = [
    { key: 'solarModule', label: 'Solar Module' },
    { key: 'solarPower', label: 'Solar Module and Rated Power' },
    { key: 'solarCount', label: 'No. of Solar Module in Plant' },
    { key: 'inverter', label: 'Inverter' },
    { key: 'inverterPower', label: 'Inverter Rated Power' },
    { key: 'inverterCount', label: 'No. of Inverter in Plant' },
    { key: 'installationType', label: 'Tracking Fixed Installation' },
    { key: 'trackingSystem', label: 'Tracking System' }
  ];

  onCountryChangeEvent(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    const selectedCountry = this.countries.find(c => c._id === selectedId);

    // Update timezone options
    this.timezones = selectedCountry?.timezones || [];
    this.regions = selectedCountry?.states || [];

    console.log(this.regions);

    const timezoneControl = this.projectForm.get('timezone');
    const currentTimezone = timezoneControl?.value;

    if (!this.isEditMode) {
      timezoneControl?.setValue('');
    } else {
      if (!currentTimezone && this.timezones.length > 0) {
        timezoneControl?.setValue(this.timezones[0]);
      }
    }

    // ✅ Update country form control
    this.projectForm.get('country')?.setValue(selectedId);
    this.projectForm.get('country')?.markAsTouched();
    this.projectForm.get('country')?.markAsDirty();

    // ✅ Update Select2 UI
    setTimeout(() => {
      const selected = this.projectForm.get('timezone')?.value;
      $(this.timezoneSelect.nativeElement)
        .val(selected)
        .trigger('change.select2');

      this.projectForm.get('timezone')?.setValue(selected);
      this.projectForm.get('timezone')?.markAsTouched();
      this.projectForm.get('timezone')?.markAsDirty();
    }, 0);

    // ✅ Region dropdown toggle based on country
    setTimeout(() => {
      const selected = this.projectForm.get('region')?.value;
      $(this.regionSelect.nativeElement)
        .val(selected)
        .trigger('change.select2');

      this.projectForm.get('region')?.setValue(selected);
      this.projectForm.get('region')?.markAsTouched();
      this.projectForm.get('region')?.markAsDirty();
    }, 0);

  }

  onTimezoneChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.projectForm.get('timezone')?.setValue(selectedValue);
    this.projectForm.get('timezone')?.markAsTouched();
    this.projectForm.get('timezone')?.markAsDirty();
  }

  ngOnDestroy(): void {
    $(this.countrySelect.nativeElement).off('change');
  }

  currentStepIndex = 0;
  stepIds = ['step1', 'step2', 'step3', 'step4', 'step5'];

  goToNextStep() {
    if (this.currentStepIndex < this.stepIds.length - 1) {
      this.currentStepIndex++;
      console.log('Current Step:', this.currentStepIndex);
      this.switchToTab(this.stepIds[this.currentStepIndex]);
    }
  }

  goToPreviousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.switchToTab(this.stepIds[this.currentStepIndex]);
    }
  }

  switchToTab(tabId: string) {
    const tabTrigger = document.querySelector(`a[href="#${tabId}"]`);
    if (tabTrigger) (tabTrigger as HTMLElement).click();
  }

  addPVSystem(): void {
    if (this.pvSystemForm.invalid) {
      Swal.fire('Warning', 'Please complete all PV system fields.', 'warning');
      return;
    }

    const config = this.pvSystemForm.value;

    if (this.editPVIndex !== null) {
      this.pvSystemList[this.editPVIndex] = config;
      this.editPVIndex = null;
    } else {
      this.pvSystemList.push(config);
    }

    this.pvSystemForm.reset();
  }

  editPVSystem(index: number): void {
    this.editPVIndex = index;
    this.pvSystemForm.patchValue(this.pvSystemList[index]);
  }

  deletePVSystem(index: number): void {
    this.pvSystemList.splice(index, 1);
    if (this.editPVIndex === index) {
      this.pvSystemForm.reset();
      this.editPVIndex = null;
    }
  }

  onSubmit(status: 'draft' | 'submitted'): void {
    if (this.projectForm.invalid) {
      const invalidFields: string[] = [];

      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        if (control && control.invalid) {
          invalidFields.push(key);
          control.markAsTouched();
        }
      });

      Swal.fire(
        'Warning',
        'Please correct the following fields: ' + invalidFields.join(', '),
        'warning'
      );

      return;
    }

    if (this.pvSystemForm.dirty && this.pvSystemForm.valid) {
      this.addPVSystem();
    }

    if (this.pvSystemList.length === 0) {
      Swal.fire('Warning', 'Please add at least one PV system configuration.', 'warning');
      return;
    }

    const payload = {
      ...this.projectForm.value,
      status: status,
      pvConfigurations: this.pvSystemList.map(({ projectId, ...rest }) => rest),
    };
    if (this.editingProjectId) {
      this.http.patch(`${this.baseUrl}/projects/${this.editingProjectId}`, payload, { headers:this.headers }).subscribe({
        next: () => {
          Swal.fire('Success', `Project ${status === 'draft' ? 'saved as draft' : 'updated'} successfully!`, 'success');
          this.resetForms();
          this.router.navigate(['/app/projects']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Error updating project.', 'error');
        }
      });
    } else {
      this.http.post(`${this.baseUrl}/projects`, payload, { headers:this.headers }).subscribe({
        next: () => {
          Swal.fire('Success', `Project ${status === 'draft' ? 'saved as draft' : 'created'} successfully!`, 'success');
          this.resetForms();
          this.router.navigate(['/app/projects']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Error creating project.', 'error');
        }
      });
    }
  }

  resetForms(): void {
    this.projectForm.reset();
    this.pvSystemForm.reset();
    this.pvSystemList = [];
    this.editingProjectId = null;
  }
  
  fetchProjects(): void {
    this.http.get<any[]>(`${this.baseUrl}/projects`, { headers:this.headers }).subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
      }
    });
  }

  deleteProject(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This project will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/projects/${id}`, { headers:this.headers }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Project deleted successfully.', 'success');
            this.fetchProjects();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Failed to delete project.', 'error');
          }
        });
      }
    });
  }

  editProject(project: any): void {
    this.http.get(`${this.baseUrl}/projects/${project._id}`, { headers:this.headers }).subscribe({
      next: (response: any) => {
        this.router.navigate(['/app/projects/create'], {
          state: {
            project: response.project,
            pvConfigurations: response.pvConfigurations
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch project:', err);
        Swal.fire('Error', 'Failed to load project data.', 'error');
      }
    });
  }
}
