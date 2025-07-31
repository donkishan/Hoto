import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, AfterViewInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import flatpickr from "flatpickr";
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

import { AuthService } from '../../../../services/auth.service';
declare var $: any;
@Component({
  selector: 'app-project-team',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './project-team.html',
  styleUrl: './project-team.css'
})

export class ProjectTeam {
  private baseUrl     = environment.apiUrl;
  private headers     : HttpHeaders;

  hotoDetails         : any;
  assetTeamBlocks     : any[] = [];
  qualityTeamBlocks   : any[] = [];
  dataTable           : any;
  isViewOnlyMode      : boolean = false;
  selectedBlockId     : string = '';
  selectedBlock       : any = null;
  selectedProjectId   : string = '';
  hotoRequestId       : string = '';
  fromDivision        : string = ''; 
  selectedDivisionId  : string = '';

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private authservice : AuthService
  ) { 
    this.headers = this.authservice.getAuthHeaders();
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    
    if (id) {
        this.loadHotoRequest(id,'');
        this.loadAssetTeamMembers(id,'686b59aa42653fcea0802ab0');
        this.loadQualityTeamMembers(id,'686b59aa42653fcea0802ab1');

        this.dataTable = $('#dataTable').DataTable({
          serverSide: true,
          processing: true,
          responsive: true,
          ordering: false,        
          ajax: {
            url: `${this.baseUrl}/block-information/datatable-members`,
            type: 'GET',
            headers: this.authservice.getRawAuthHeaders(),
            data: (d:any) => {
              d.divisionId    = this.selectedDivisionId;
              d.projectId     = this.selectedProjectId;
              d.hotoRequestId = this.hotoRequestId;
              d.blockId       = this.selectedBlockId;
              d.status        = 'ASSIGNED';
              d.fromDivision  = this.fromDivision; 
            }
          },
          columns: [
            { data: 'name' },
            { data: 'role_name' },
            { data: 'deployed_date' },
            { data: 'email' },            
          ]         
        });              
    } else {
      console.error('No ID found in route');
    }
  }

  loadHotoRequest(id: string, divisionId: string): void {    
    this.http.get<any>(`${this.baseUrl}/hoto-requests/${id}`, { headers:this.headers })
    .subscribe({
      next: (data) => {
        this.hotoDetails = data;
        this.selectedProjectId = this.hotoDetails.projectId;
        this.hotoRequestId = this.hotoDetails._id;
      },
      error: (err) => {
        console.error('Error loading HOTO request', err);
      }
    });
  }

  loadAssetTeamMembers(id: string, divisionId: string): void { 
    this.selectedDivisionId = divisionId;   
    this.http.get<any>(`${this.baseUrl}/hoto-requests/division-wise/${id}/${divisionId}`, { headers:this.headers })
    .subscribe({
      next: (data) => {
        this.assetTeamBlocks = data.blocks;        
      },
      error: (err) => {
        console.error('Error loading HOTO request', err);
      }
    });
  }

  loadQualityTeamMembers(id: string, divisionId: string): void {   
    this.selectedDivisionId = divisionId; 
    this.http.get<any>(`${this.baseUrl}/hoto-requests/division-wise/${id}/${divisionId}`, { headers:this.headers })
    .subscribe({
      next: (data) => {
        this.qualityTeamBlocks = data.blocks;        
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
        this.loadHotoRequest(hotoId,'');
      });
    }  
  }

  //open modal
  openAddMemberModal(blockId: string,isViewMode: boolean,from_team: string) {
    // this.selectedBlock = this.blocks.find(b => b._id === blockId);
    // alert(isViewMode);
    this.selectedBlockId = blockId; 
    this.isViewOnlyMode = isViewMode;
    this.fromDivision = from_team;
    this.dataTable.ajax.reload();    
  }

  request_for_acknowledgement(blockId: string,fromDivision: string): void {
    const userId = localStorage.getItem('userId'); 
    
    if(this.fromDivision==="quality_team"){
      this.selectedDivisionId = "686b59aa42653fcea0802ab1"; 
    }else{
      this.selectedDivisionId = "686b59aa42653fcea0802ab0"; 
    }
    const divisionId = this.selectedDivisionId;
    
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to acknowledge for team.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Acknowledge',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(
        `${this.baseUrl}/block-information/${blockId}/acknowledge`,
          { userId, divisionId }, 
          { headers : this.headers}
        ).subscribe({
          next: () => {
            Swal.fire('Success', 'Acknowledgement successfully.', 'success')
            .then(() => {
              this.loadAssetTeamMembers(this.hotoRequestId,'686b59aa42653fcea0802ab0');
              this.loadQualityTeamMembers(this.hotoRequestId,'686b59aa42653fcea0802ab1');

              

            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to acknowledge.', 'error');
          }
        });
      }
    });
  }

}
