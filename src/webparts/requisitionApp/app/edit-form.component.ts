import { SPService } from "./services/sp.service";
import { AppConfigService } from "./services/app.config.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Requisition, Employee, FormStatus, AppConfig, ApprovalLevel, Office } from "./models/requisition";
import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
    selector: "req-editform",
    template: `
        <div class="req-form">
            <div class="form-group-header header-userinfo">Employee Information</div>
                <div>
                    <div>{{item.EmployeeName}}</div>
                    <div>{{item.EmployeeEmail}}</div>
                    <div>{{item.EmployeeTitle}}</div>
                    <div>{{item.Department}}</div>
                </div>
            <div class="form-group-header header-details">Requisition Details</div>
            
            <form [formGroup]="rForm">
                <div class="container">
                    <div class="row">
                        <div class="form-group col-sm-6">
                            <label  for="field-office">Office</label>
                            <input id="field-office" formControlName="office" class="form-control" disabled="true">
                        </div>
                        <div class="form-group col-sm-6">
                            <label for="field-submitdate">Submit date</label>
                            <input id="field-submitdate" class="form-control" disabled="true" formControlName="submitDate">
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-sm-6">
                            <label for="field-category">Category</label>
                            <input id="field-category" formControlName="type" class="form-control" disabled="true">
                        </div>
                        <div class="form-group col-sm-6">
                            <label for="field-subcategory">Sub type</label>
                            <input id="field-subcategory" formControlName="subType" class="form-control" disabled="true">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="field-amount">Amount</label>
                        <input id="field-amount" value="{{item.Amount|currency:'USD':true}}" class="form-control" disabled="true">
                    </div>
                    <div class="form-group">
                        <label for="field-amount">Description</label>
                        <textarea class="form-control" formControlName="description" rows="4" disabled="true"></textarea>
                    </div>
                    <div class="form-group">
                            <label class="">Workflow history</label>
                        <textarea class="form-control" rows="4" disabled="true">{{item.ApprovalComment}}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="center-block">Approval comment</label>
                        <textarea class="form-control" formControlName="comment" rows="4"></textarea>
                    </div>
                    <div class="form-group row form-buttons">
                        <button *ngIf="finishedStage ===true" type="button" class=" btn btn-primary" 
                            (click)="onFormCompleted($event)">Complete</button>
                        <button *ngIf="finishedStage ===false" type="button" class=" btn btn-primary" 
                            (click)="onFormApproved($event)">Approve</button>
                        <button *ngIf="finishedStage ===false" type="button" class="btn btn-primary" 
                            (click)="onFormRejected($event)">Reject</button>
                        <button *ngIf="finishedStage ===false"  type="button" class="btn btn-primary" 
                            (click)="onFormReturned($event)">Return</button>
                        <button type="button" class="btn btn-cancel" (click)="onFormCancelled()">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    `
})
export class EditFormComponent implements OnInit {



    @Input("editItem") item:Requisition;
    @Input() curUser:Employee;
    @Input() appConfig: AppConfig;

    @Output() onReturned: EventEmitter<Requisition> = new EventEmitter<Requisition>();

    public rForm: FormGroup;
    public finishedStage: boolean;
    constructor(private fb:FormBuilder,
                private appConfigService: AppConfigService,
                private spService: SPService ) {
        this.createForm();
        this.finishedStage = false;
    }

    ngOnInit(): void {}
    
    // when input value get changed
    ngOnChanges(): void {
        this.finishedStage = (this.item.ApprovalStage === "2"); //fornow, HR is the last stage
        this.rForm.setValue({
            office: this.item.Office,
            submitDate: this.item.SubmitDate,
            type: this.item.Category,
            subType: this.item.SubCategory,
            amount: this.item.Amount,
            description: this.item.Description,
            comment: ""
        });
    }

    onFormCompleted(event:any): void {
        console.log("requisition is completed");
        this.item.ApprovalComment += this.formatComment(this.rForm.value.comment,FormStatus[FormStatus.Completed]);
        this.item.RequestStatus = FormStatus[FormStatus.Completed];
        this.spService.updateRequisition(this.item)
            .subscribe( done => this.onReturned.emit());
    }

    // event when form is approved
    onFormApproved(event:any): void {
        console.log("requisition is approved");
        this.item.ApprovalComment += this.formatComment(this.rForm.value.comment,FormStatus[FormStatus.Approved]);
        this.item.ApprovalStage = this.getNewStage();
        this.item.RequestStatus = FormStatus[FormStatus.InProgress];
        this.item.PendingApprovalGroup = this.getNextPendingApprovalGroup(this.item.ApprovalStage);
        this.spService.updateRequisition(this.item)
            .subscribe( done => this.onReturned.emit());
    }

    // event when form is rejected
    onFormRejected(event:any): void {
        console.log("requisition is rejected");
        this.item.ApprovalStage = "0";
        this.item.ApprovalComment += this.formatComment(this.rForm.value.comment,FormStatus[FormStatus.Rejected]);
        this.item.RequestStatus = FormStatus[FormStatus.Rejected];
        this.item.PendingApprovalGroup = "";
        this.spService.updateRequisition(this.item)
            .subscribe( done => this.onReturned.emit());
    }

    // event when form is returned
    onFormReturned(event:any): void {
        console.log("requisition is returned");
        this.item.ApprovalStage = "0";
        this.item.ApprovalComment += this.formatComment(this.rForm.value.comment,FormStatus[FormStatus.Returned]);
        this.item.RequestStatus = FormStatus[FormStatus.Returned];
        this.item.PendingApprovalGroup = "Requester";
        this.spService.updateRequisition(this.item)
            .subscribe( done => this.onReturned.emit());
    }

    // go back to main view
    onFormCancelled():void {
        this.onReturned.emit();
    }

    
    // build up the edit form
    formatComment(comment:string,action: string): string {
        let stageName:string = "Manager";
        if(this.item.ApprovalStage === "1") {
            stageName = "Exec";
        }else if (stageName === "2") {
            stageName = "HR";
        }
        return (new Date()).toLocaleDateString() + ": " + action + " by " +
            this.curUser.PreferredName + "[" + stageName + "]. Comment: " + comment + "\n";
    }

    // get the next stage
    // todo: need to read from appConfig for approval levels, and query
    getNewStage():string {
        let curStage:number = Number(this.item.ApprovalStage);
        if(curStage === 0 && Number(this.item.Amount) < 250) {
            return "2"; // next stage is HR
        }else if (curStage === 0) {
            return "1"; // exec approval
        }else {
            return "2";
        }
    }

    // get next pending Approval group based on the request approval stage
    getNextPendingApprovalGroup(stage: string): string {
        try {
            let index: number = Number(stage);
            let office:Office = this.appConfig.offices.filter(off => off.name.toLowerCase() === this.item.Office.toLowerCase())[0];
            let approvalLevel: ApprovalLevel = office.approvalMatrix[index];
            return approvalLevel.approvalGroup;
        } catch (error) {
            console.error("Error in getNextPendingApprovalGroup",error);
            return "";
        }
    }

    // build reactive form
    createForm():void {
        this.rForm = this.fb.group({
            office:"",
            submitDate: "",
            type: "",
            subType: "",
            amount: "",
            description: "",
            comment:["",Validators.required]
        });
    }
}