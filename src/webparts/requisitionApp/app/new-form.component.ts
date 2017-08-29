import { SPService } from "./services/sp.service";
import { AppConfig, Employee, appConfig, Requisition, RequisitionType, Office, ReqSubType } from "./models/requisition";
import { AppConfigService } from "./services/app.config.service";
import { Component, Input, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {Environment, EnvironmentType} from "@microsoft/sp-core-library";

@Component({
    selector: "req-newform",
    template: `
        <div class="req-form">
            <div class="form-group-header header-userinfo">Employee Information</div>
                <div>
                    <div>{{requester.PreferredName}}</div>
                    <div>{{requester.WorkEmail}}</div>
                    <div>{{requester.Title}}</div>
                    <div>{{requester.Department}}</div>
                </div>
            <div class="form-group-header header-details">Requisition Details</div>

            <form [formGroup]="rForm" (ngSubmit)="onFormSubmit()" >
                <div class="container">
                    <div class="row">
                <div class="form-group col-sm-6">
                    <label  for="field-office">Office</label>
                        <select id="field-office" class="form-control" formControlName="office" (change)="officeSelected($event)">
                            <option *ngFor="let office of offices" [value]="office.name">{{office.displayName}}</option>
                        </select>
                </div>
                <div class="form-group col-sm-6">
                    <label for="field-submitdate">Submit Date</label>
                    <input id="field-submitdate" class="form-control" disabled="true" formControlName="submitDate">
                </div>
                </div>
                <div class="row">
                <div class="form-group col-sm-6">
                    <label for="field-category">Category</label>
                        <select id="field-category" class="form-control" formControlName="type" (change)="typeSelected($event)">
                            <option *ngFor="let type of types" [value]="type.name">
                                {{type.displayName}}
                            </option>
                        </select>
                </div>
                <div class="form-group col-sm-6">
                    <label for="field-subcategory">Sub Type</label>
                        <select id="field-subcategory" class="form-control" formControlName="subType">
                            <option *ngFor="let stype of subTypes" [value]="stype.name">
                                {{stype.displayName}}
                            </option>
                        </select>
                </div>
                </div>
                <div class="form-group">
                    <label for="field-amount">Amount</label>
                    <input id="field-amount" class="form-control" formControlName="amount">
                </div>
                <div class="form-group">
                    <label for="field-amount">Description</label>
                    <textarea class="form-control" formControlName="description" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <input type="file" class="form-control" (change)="onUploadFile($event)" placeholder="Upload file">
                </div>
                <div *ngIf="showAlert" class="alert alert-danger">
                    Invalid form data! 
                </div>
                <div class="form-group row form-buttons">
                    <button type="submit" class=" btn btn-primary">Submit</button>
                    <button type="button" class="btn btn-cancel" (click)="onCancelled()">Cancel</button>
                </div>
                </div>
            </form>
        </div>
    `
})
export class NewFormComponent {

    @Input() returnedItem: Requisition;
    @Input() curUser:Employee;
    @Input() appConfig: AppConfig;

    @Output() onReturned:EventEmitter<Requisition> = new EventEmitter<Requisition>();

    rForm: FormGroup;
    webUrl: string;
    requester: Employee;
    offices: Office[];
    types: RequisitionType[];
    subTypes:ReqSubType[];
    today:number  = Date.now();
    attachment:File;
    hrgroup: string;
    showAlert: boolean;
    constructor(private fb:FormBuilder,
                private appConfigService: AppConfigService,
                private spService: SPService ) {
        this.requester = this.requester || new Employee();
        this.offices = this.types = this.subTypes = [];
        this.showAlert = false;
        this.createForm();
    }
    ngOnChanges(): void {
        this.requester = this.curUser;
        this.offices = this.appConfig.offices;
        this.types = this.appConfig.types;
        this.subTypes = this.appConfig.types[0].subTypes;
        if(this.returnedItem) {
            this.rForm.setValue({
                office:this.returnedItem.Office,
                submitDate: this.returnedItem.SubmitDate,
                type: this.returnedItem.Category,
                subType: this.returnedItem.SubCategory,
                amount: this.returnedItem.Amount,
                description: this.returnedItem.Description
            });
        }
    }

    officeSelected(event:any): void {
        //let selOffice:string = this.rForm.get("office").value;
        //this.types = Object.keys(appConfig[selOffice].types);
    }
    typeSelected(event:any): void {
        let typeName:string = this.rForm.get("type").value;
        let typeObj: RequisitionType = this.appConfig.types.filter(req => req.name === typeName)[0];
        this.subTypes = typeObj.subTypes;
        console.log(this.subTypes);
    }
    onFormSubmit(): void {
        if(this.rForm.invalid) {
            this.showAlert = true;
            return;
        }
        if(this.returnedItem) {
            this.updateRequisitionItem();
            console.log("re-submitting request");
        } else {
            this.setupRequisitionItem();
            console.log("submitting request");
        }
    }
    onCancelled(): void {
        this.onReturned.emit();
    }
    onUploadFile(event): void {
        let fileList:FileList = event.target.files;
        if(fileList.length > 0) {
            this.attachment = fileList[0];
        }else {
            this.attachment = null;
        }
    }
    setupRequisitionItem(): void {
        const formModel = this.rForm.value;
        const spItem: Requisition = {
            Title: this.requester.PreferredName,
            EmployeeName: this.requester.PreferredName,
            EmployeeEmail: this.requester.WorkEmail,
            EmployeeTitle: this.requester.Title,
            Department: this.requester.Department,
            Manager: this.requester.Manager ,
            Office: formModel.office,
            Category: formModel.type,
            SubCategory: formModel.subType,
            Amount: formModel.amount,
            Description: formModel.description,
            RequestStatus: "Submitted",
            ApprovalStage: "0",
            PendingApprovalGroup: "Manager",   // when submitted, it goes to manager first
            ApprovalComment:(new Date()).toLocaleDateString() +  ": submitted by " + this.requester.PreferredName + "\n"
        };
        this.spService.addRequisition(spItem,this.attachment)
            .subscribe(done => this.onReturned.emit());
    }
    updateRequisitionItem(): void {
        let formModel = this.rForm.value;
        this.returnedItem.Office = formModel.office;
        this.returnedItem.Category = formModel.type;
        this.returnedItem.SubCategory = formModel.subType;
        this.returnedItem.Amount = formModel.amount;
        this.returnedItem.Description = formModel.description;
        this.returnedItem.RequestStatus = "Re-Submitted";
        this.returnedItem.ApprovalStage = "0";
        this.returnedItem.PendingApprovalGroup = "Manager";
        this.returnedItem.ApprovalComment += this.formatComment("","Re-submitted");

        this.spService.updateRequisition(this.returnedItem)
            .subscribe(done => this.onReturned.emit());
    }


    // build up the edit form
    formatComment(comment:string,action: string): string {
        return (new Date()).toLocaleDateString() + ": " + action + " by " + this.curUser.PreferredName + "\n";
    }

    getWebUrl(): void {
        this.appConfigService.getWebUrl()
        .subscribe(url => this.webUrl = url);
    }


    // build reactive form
    createForm(): void {
        this.rForm = this.fb.group({
            office:["",Validators.required],
            submitDate: [(new Date()).toLocaleDateString(), Validators.required],
            type:["", Validators.required],
            subType:["", Validators.required],
            amount: ["",Validators.required],
            description: ""
        });
    }
}