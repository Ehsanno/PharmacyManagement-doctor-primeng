import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { SharedModule } from '../../shared/shared.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { FocusTrapModule } from 'primeng/focustrap';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuModule } from 'primeng/menu';
import { DoctorReportComponent } from './report/doctor-report.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { AddEditDoctorDialogModule } from '../dialogs/add-edit-doctor-dialog/add-edit-doctor-dialog.module';

const routes: Routes = [{ path: 'report', component: DoctorReportComponent }];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    ContextMenuModule,
    MenuModule,
    DividerModule,
    ChipModule,
    TableModule,
    FocusTrapModule,
    RippleModule,
    PaginatorModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    AutoCompleteModule,
    DropdownModule,
    ConfirmPopupModule,
    SkeletonModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    DynamicDialogModule,
    AddEditDoctorDialogModule,
  ],
  declarations: [
    DoctorReportComponent,
  ],
})
export class DoctorsModule { }
