import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isDivision'
})
export class IsDivisionPipe implements PipeTransform {

  transform(allowedDivisions: string[]): boolean {
    const division = localStorage.getItem('divisionName') || '';
    // console.log('Checking division:', division, 'against allowed divisions:', allowedDivisions);
    return allowedDivisions.includes(division);
  }
}
