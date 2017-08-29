import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { AppConfigService } from "./services/app.config.service";
import { Requisition, Employee, AppConfig } from "./models/requisition";
import { SPService } from "./services/sp.service";
import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";

@Component({
    selector: "req-view",
    template: `
        <div *ngIf="items.length > 0" >
        <p-dataTable [value]="items[0]" loadingIcon="fa-spinner" [responsive]="true" class="ptable" >
            <p-header><div class="ui-helper-clearfix">My requests</div></p-header>
            <p-column styleClass="pc-id" field="ID" header="ID" [sortable]="true" [style]="{'width':'60px'}"></p-column>
            <p-column styleClass="pc-title" field="Title" header="Title" [sortable]="true">
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
        <div class="table-header"></div>
        <p-dataTable [value]="items[1]" loadingIcon="fa-spinner" [responsive]="true" class="ptable" >
            <p-header><div class="ui-helper-clearfix">My pending approvals</div></p-header>
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
            <p-column styleClass="pc-id" field="ID" header="ID" [sortable]="true" [style]="{'width':'60px'}"></p-column>
            <p-column styleClass="pc-title" field="Title" header="Title" [sortable]="true">
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
        <div class="table-header"></div>
        <p-dataTable [value]="items[2]" loadingIcon="fa-spinner" [responsive]="true" class="ptable" >
            <p-header><div class="ui-helper-clearfix">HR approvable requests </div></p-header>
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
            <p-column styleClass="pc-id" field="ID" header="ID" [sortable]="true" [style]="{'width':'60px'}"></p-column>
            <p-column styleClass="pc-title" field="Title" header="Title" [sortable]="true">
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
    
})
export class ViewComponent implements OnInit {
    @Output() onItemEdited: EventEmitter<Requisition> = new EventEmitter<Requisition>();
    @Output() onItemViewed: EventEmitter<Requisition> = new EventEmitter<Requisition>();
    @Input() appConfig: AppConfig;

    public viewName: string;
    public items: Array<Requisition[]>;
    public wpContext: IWebPartContext;
    public curUser: Employee;
    protected dataReady: boolean = false;

    // setup for HandsonTable
    public myRequisitions: Requisition[];
    public myPendings: Requisition[];
    public myApprovables: Requisition[];
    protected colHeaders: string[];
    protected columns: any[];
    protected colWidths: number[];
    protected options: any;
    protected rows:any[];


    
    constructor(private spService: SPService, private appService: AppConfigService) {
        this.items = new Array();
    }

    ngOnInit(): void {
        this.wpContext = this.appService.getWPContext();
        this.loadCurUser();
    }
    ngOnChanges(): void {
    }
    renderView():void {
        this.spService.loadMyRequisitions(this.curUser).subscribe(data => {
            this.items.push(data);
                this.myRequisitions = this.items[0];
                this.myPendings = this.items[1];
                this.myApprovables = this.items[2];
        });
    }
    loadCurUser():void {
        this.appService.loadCurrentUser().subscribe(data =>  {
            this.curUser = data;
            this.curUser.UserId = this.wpContext.pageContext.legacyPageContext.userId;
            this.appService.getUserGroups().subscribe( groups => {
                this.curUser.SPGroups = groups;
                this.renderView();
                this.dataReady = true;
            });
        });
    }
    editItem(item:Requisition): void {
        this.onItemEdited.emit(item);
    }
    viewItem(item: Requisition): void {
        this.onItemViewed.emit(item);
    }
}
