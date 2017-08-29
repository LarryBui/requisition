import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { AppConfigService } from "./services/app.config.service";
import { Requisition, Employee } from "./models/requisition";
import { SPService } from "./services/sp.service";
import { Component, OnInit, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "req-viewall",
    template: `
        <div *ngIf="items.length > 0" >
        <p-dataTable [value]="items" loadingIcon="fa-spinner" [responsive]="true" class="ptable" >
            <p-column styleClass="pc-edit">
                <ng-template let-col let-item="rowData" pTemplate="body">
                    <a href="javascript:void(0)" (click)="editItem(item)">
                        <span class="ms-displayInlineBlock">
                            <span class="ms-navedit-editLinksIconWrapper ms-verticalAlignMiddle">
                                <img class="ms-navedit-editLinksIcon" 
                                    src="/_layouts/15/images/spcommon.png?rev=44#ThemeKey=spcommon" 
                                    alt="Edit Requisition">
                            </span>
                        </span>
                    </a>
                </ng-template>
            </p-column>
            <p-column field="ID" styleClass="pc-id" header="ID" [sortable]="true" [style]="{'width':'60px'}"></p-column>
            <p-column field="Title" header="Title" [sortable]="true">
                <ng-template let-col let-item="rowData" pTemplate="body">
                    <a href="javascript:void(0)" (click)="viewItem(item)">{{item.Title}}</a>
                </ng-template>
            </p-column>
            <p-column styleClass="pc-submitdate" field="SubmitDate" header="Submit Date" [sortable]="true">
                <ng-template let-col let-item="rowData" pTemplate="body">
                    <span>{{item[col.field] | date:'shortDate'}}</span>
                </ng-template>
            </p-column>
            <p-column styleClass="pc-office" field="Office" header="Office" [sortable]="true">
                <ng-template let-col let-item="rowData" pTemplate="body">
                    <span>{{item[col.field] | titleCase }}</span>
                </ng-template>
            </p-column>
            <p-column styleClass="pc-amount" field="Amount" header="Amount" [sortable]="true">
                <ng-template let-col let-item="rowData" pTemplate="body">
                    <span>{{item[col.field] | currency:'USD':true }}</span>
                </ng-template>
            </p-column>
            <p-column styleClass="pc-status" field="RequestStatus" header="Status" [sortable]="true"></p-column>
            <p-column styleClass="pc-pending" field="PendingApprovalGroup" header="Pending on" [sortable]="true"></p-column>
        </p-dataTable>
        </div>
    `,
    providers:[]
})
export class ViewAllComponent implements OnInit {

    @Output() onItemEdited: EventEmitter<Requisition> = new EventEmitter<Requisition>();
    @Output() onItemViewed: EventEmitter<Requisition> = new EventEmitter<Requisition>();

    items: Requisition[];
    public wpContext: IWebPartContext;
    public curUser: Employee;
    constructor(private spService: SPService, private appService: AppConfigService) {
        this.items = new Array<Requisition>();
    }
    ngOnInit(): void {
        this.renderView();
    }
    renderView():void {
        this.spService.loadAllRequisitions().subscribe(data => {
            this.items = data;
        });
    }
    editItem(item:Requisition): void {
        this.onItemEdited.emit(item);
    }
    viewItem(item: Requisition): void {
        this.onItemViewed.emit(item);
    }
}