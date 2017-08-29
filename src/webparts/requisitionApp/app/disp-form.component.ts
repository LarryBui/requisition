import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Requisition } from "./models/requisition";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "req-dispform",

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
                        <input id="field-amount" value="{{item.Amount|currency:'USD':true}}"class="form-control" disabled="true">
                    </div>
                    <div class="form-group">
                        <label for="field-amount">Description</label>
                        <textarea class="form-control" formControlName="description" rows="4" disabled="true"></textarea>
                    </div>
                    <div class="form-group">
                            <label class="">Workflow history</label>
                        <textarea class="form-control" rows="4" disabled="true">{{item.ApprovalComment}}</textarea>
                    </div>
                    <div class="form-group row form-buttons">
                        <button type="button" class="btn btn-cancel" (click)="onFormCancelled()">Close</button>
                    </div>
                </div>
            </form>
        </div>
    `

})
export class DispFormComponent implements OnInit {

    @Input("reqItem") item: Requisition;

    @Output() onReturned:EventEmitter<Requisition> = new EventEmitter<Requisition>();

    public rForm: FormGroup;

    constructor(private fb: FormBuilder) { 
        this.createForm();
    }

    ngOnInit() { }

    ngOnChanges():void {
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

    onFormCancelled():void {
        this.onReturned.emit();
    }

    createForm():void {
        this.rForm = this.fb.group({
            office:"",
            submitDate: "",
            type: "",
            subType: "",
            amount: "",
            description: "",
            comment: ""
        });
    }
}