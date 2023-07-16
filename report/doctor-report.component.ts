import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService, SortEvent } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { Observable, of } from 'rxjs';
import { LayoutService } from '../../../../layout/service/app.layout.service';
import { AddEditDoctorDialogComponent } from '../../dialogs/add-edit-doctor-dialog/add-edit-doctor-dialog/add-edit-doctor-dialog.component';
import { IDoctor } from '../../../models/doctor.model';
import { IAdvancedSpeciality, ISpeciality } from '../../../models/general-config.model';
import { IPaginationHeader } from '../../../models/pagination.model';
import { DoctorService, IGetDoctorsListParameters } from '../../../services/doctor.service';
import { GeneralConfigService } from '../../../services/general-config.service';
import { TabService } from '../../../services/tab.service';
import { UiService } from '../../../services/ui.service';

@Component({
  // selector: 'app-report',
  templateUrl: './doctor-report.component.html',
  providers: [TabService, DialogService, MessageService, ConfirmationService],
  styleUrls: ['./doctor-report.component.scss']
})
export class DoctorReportComponent implements OnInit, OnDestroy {
  //pagination
  totalCount = 0;
  pageSize = 20;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  isLoading = false;
  doctorsList: IDoctor[] = [];
  doctorSearch: IGetDoctorsListParameters = {
    fetchFromHq: false,
    query: null,
    pageNumber: 1,
    suspended: false,
    pageSize: this.pageSize
  };
  doctorSearchFormGroup!: FormGroup;
  //baseConfig Variables
  specialityList: ISpeciality[] = [];
  advancedSpecialityFullList: IAdvancedSpeciality[] = [];

  //search advancedSpeciality
  advancedSpecialityFilterList: IAdvancedSpeciality[] = [];
  finalAdvancedSpecialityList = new Observable<IAdvancedSpeciality[]>();

  //getDoctorFromUi
  selectedDoctor: IDoctor = null;

  //menu item
  listMenu!: MenuItem[];
  // dialog
  dialogRef: DynamicDialogRef;


  ngOnInit(): void {
    this.configMenuList();
    this.getBaseConfig();
    // (click) = "show()"
  }
  ngOnDestroy() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }


  //config menu in table
  configMenuList(doctor: IDoctor = <IDoctor>{}, event: any = null) {
    if (doctor)
      this.selectedDoctor = doctor;
    this.listMenu = [{
      label: 'عملیات',
      items: [
        {
          label: 'بروزرسانی', icon: 'pi pi-refresh', visible: this.selectedDoctor?.inLocalDb ?? false,
          command: () => {
            this.addEditDoctor(this.selectedDoctor);
          }
        },
        {
          label: 'حذف', icon: 'pi pi-times',
          visible: (this.selectedDoctor?.inLocalDb ?? false) && (!this.selectedDoctor?.softDeleted ?? false),
          command: () => {
            this.confirmDeleteDialog(this.selectedDoctor, event);
          }
        },
        {
          label: 'بازگرداندن', icon: 'pi pi-times',
          visible: (this.selectedDoctor?.inLocalDb ?? false) && (this.selectedDoctor?.softDeleted ?? false),
          command: () => {
            this.confirmRecoverDialog(this.selectedDoctor, event);
          }
        },
      ]
    },
    ];
  }

  // getInitConfig
  getBaseConfig() {
    this.generalService.getConfig().subscribe((res) => {
      this.specialityList = res.speciality;
      this.specialityList.unshift({
        id: null,
        title: 'همه',
        menuOrder: 1,
        uid: 1
      });
      this.specialityList.forEach((spec) => {
        if (spec.id === 'guid')
          spec.color = 'cl-coal';
        else spec.color = 'cl-red';
      });
      this.advancedSpecialityFullList = res.advancedSpeciality;
      this.searchDoctor();
      // this.show()
    });
  }
  searchDoctor(page: number = 0, sortingFieldName: string = 'MedicalSystemCode', ascending: boolean | null = true) {
    this.doctorSearch = this.doctorSearchFormGroup.getRawValue();
    //check advancedSpeciality is valid
    if (this.doctorSearchFormGroup.controls.advancedSpeciality?.value?.id)
      this.doctorSearch.advancedSpeciality = this.doctorSearchFormGroup.controls.advancedSpeciality.value.id;
    else this.doctorSearch.advancedSpeciality = null;

    this.doctorSearch?.query?.length !== 0 ?? null;
    this.doctorSearch?.specialCode?.length !== 0 ?? null;
    this.doctorSearch?.name?.length !== 0 ?? null;
    this.doctorSearch.pageNumber = page + 1;
    this.doctorSearch.ascending = ascending;
    this.doctorSearch.sortingFieldName = sortingFieldName;
    this.isLoading = true;

    if (this.doctorSearch.specialCode === '') {
      this.doctorSearch.specialCode = null;
    }

    this.doctorService.getDoctorsList(this.doctorSearch).subscribe((data: HttpResponse<any>) => {
      const pageHeaders: IPaginationHeader = JSON.parse(
        data.headers.get('Pagination')!
      );
      this.totalCount = pageHeaders.totalItems;
      this.doctorsList = data.body;
      this.doctorsList.forEach((doc) => {
        this.advancedSpecialityFullList.forEach((ad) => {
          if (doc?.advancedSpecialityId === ad.id && doc?.advancedSpecialityId !== null)
            doc.advancedSpeciality = ad;
        });
        this.specialityList.forEach((spec) => {
          if (doc?.specialityId === spec.id && doc?.specialityId !== null)
            doc.speciality = spec;
        });
      });
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false;
    });
  }

  // api calls for doctor
  attachDoctor(model: IDoctor) {

  }
  deleteDoctor(model: IDoctor) {

  }
  recoverDoctor(model: IDoctor) {

  }

  // only number in text input
  numericOnly(event: any): boolean {
    const pattern = /^([0-9+*-])$/;
    const result = pattern.test(event.key);
    return result;
  }

  //auto complete advancedSpecialty
  // .........................
  //update advancedSpecialty by specialty Change
  updateAdvanceSpecialityList() {
    this.advancedSpecialityFilterList = this.advancedSpecialityFullList;
    const specialityId = this.doctorSearchFormGroup.controls.speciality.value.id;
    this.doctorSearchFormGroup.controls.advancedSpeciality.setValue(null);
    if (specialityId) {
      this.advancedSpecialityFilterList = this.advancedSpecialityFilterList.filter(x => x.specialityId === specialityId);
      this.finalAdvancedSpecialityList = of(this.advancedSpecialityFilterList);
    }
  }
  //update advancedSpecialty by text in autoComplete
  filterAdvanceSpeciality(event) {
    this.finalAdvancedSpecialityList = of(this.advancedSpecialityFilterList.filter(x => x.title.includes(event.query)));
  }
  // .........................
  //submit header
  checkIsEmpty() {
    if (this.doctorSearchFormGroup.pristine) {
      return;
    }
    this.doctorSearchFormGroup.markAsPristine();
    this.startSearch();
  }

  // sort
  customSort(event: SortEvent) {
    const ascending = (event.order === 1 ? true : false);
    this.searchDoctor(0, event.field, ascending);
  }

  // edit and create Dialog
  addEditDoctor(doctor?: IDoctor | string) {
    this.dialogRef = this.dialogService.open(AddEditDoctorDialogComponent, {
      header: doctor ? 'بروزرسانی دکتر' : 'ایجاد دکتر جدید',
      width: '70%',
      data: doctor,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    });
    this.dialogRef.onClose.subscribe((res) => {
      if (res) {
        this.startSearch();
      }
    });
  }

  //confirm Dialge
  confirmDeleteDialog(model: IDoctor, event) {
    this.confirmationService.confirm({
      message: 'آیا پزشک حذف شود ؟',
      header: 'حذف پزشک',
      target: event.target,
      acceptLabel: 'تایید',
      rejectLabel: 'انصراف',

      acceptButtonStyleClass: 'p-button-sm',
      rejectButtonStyleClass: 'p-button-sm p-button-outlined ml-2',
      defaultFocus: 'none',
      accept: (type) => {
        this.deleteDoctor(model);
      },
      reject: (type) => {
        this.uiService.showSnackSuccess('عملیات لغو شد', 'کنسل شد!');
      }
    });
  }

  //reset pagination
  startSearch() {
    // manually trigger paginator to start query
    if (this.paginator.paginatorState.page !== 0)
      this.paginator.changePage(0);
    else
      this.searchDoctor();
  }
}
