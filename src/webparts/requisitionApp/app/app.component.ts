import { AppConfigService } from "./services/app.config.service";
import { SPService } from "./services/sp.service";
import { Component, OnInit } from "@angular/core";
import { RenderModes, Requisition, AppConfig, Employee, FormStatus, ApprovalLevel, Office } from "./models/requisition";

@Component({
    selector: "req-app",
    template: `
        <div *ngIf="dataReady" class="card card-block app-main">
            <div class="card-header" [class.req-admin]="isAdmin">
               <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link" (click)="renderView()" [class.active]="renderMode=='view'" >My Requisitions</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link " (click)="renderNewForm()" [class.active]="renderMode=='newform'" >New Requisition</a>
                    </li>
                    <li class="nav-item" *ngIf="isAdmin">
                        <a class="nav-link " (click)="renderViewAll()" [class.active]="renderMode=='viewall'">View All</a>
                    </li>
                    <li class="nav-item" *ngIf="isAdmin">
                        <a class="nav-link " (click)="renderAdmin()" [class.active]="renderMode=='admin'">Admin</a>
                    </li>
                    <li class="nav-item" *ngIf="isAdmin">
                        <a class="nav-link " (click)="renderBI()" [class.active]="renderMode=='bi'">Reports</a>
                    </li>
               </ul>
            </div>
            <div class="card-body">
                <div [ngSwitch]="renderMode">
                    <req-newform *ngSwitchCase="'newform'" 
                        [returnedItem]="reqItem" 
                        [curUser]="curUser"
                        [appConfig]="appConfig"
                        (onReturned)="renderView()"></req-newform>
                    <req-editform *ngSwitchCase="'editform'" 
                        [editItem]="reqItem" 
                        [curUser]="curUser"
                        [appConfig]="appConfig"
                        (onReturned)="renderView()"></req-editform>
                    <req-dispform *ngSwitchCase="'dispform'" [reqItem]="reqItem"
                        (onReturned)="renderView()"
                        ></req-dispform>
                    <req-viewall *ngSwitchCase="'viewall'"
                        (onItemEdited)="renderEditForm($event)" 
                        (onItemViewed)="renderDispForm($event)">
                        ></req-viewall>
                    <req-admin *ngSwitchCase="'admin'"
                        [appConfig]="appConfig"
                        ></req-admin>
                    <req-bi *ngSwitchCase="'bi'"></req-bi>
                    <req-view *ngSwitchDefault (onItemEdited)="renderEditForm($event)" 
                        (onItemViewed)="renderDispForm($event)"
                        [appConfig]="appConfig"
                        ></req-view>
                </div>
            </div>
        </div>
    `
})

export class AppComponent implements OnInit {

    public renderMode: RenderModes;
    public curUser: Employee;
    public userGroups: string[];
    public reqItem: Requisition;
    public isAdmin: boolean;
    public isEditor: boolean;
    public appConfig:AppConfig;
    public dataReady: boolean;

    constructor(private spService: SPService, private appService: AppConfigService) {
        //this.renderMode = "view";
        this.isAdmin = false;
        this.dataReady = false;
    }
    ngOnInit(): void {
        this.appService.loadAppConfig()
            .subscribe(config => this.appConfig = config);
        this.appService.loadCurrentUser()
            .subscribe(user => {
                this.curUser = user;
                // get user groups after user profile is loaded
                this.appService.getUserGroups().subscribe( groups => {
                    this.curUser.SPGroups = groups;
                    this.isAdmin = this.isCurUserAdmin();
                    this.renderMode = "view";
                    this.dataReady = true;
                    console.log(this.curUser.SPGroups);
                });
            });
    }
    renderView():void {
        this.reqItem = null;
        this.renderMode = "view";
    }
    renderNewForm():void {
        this.reqItem = null;
        this.renderMode = "newform";
    }

    // condition to render edit mode
    renderEditForm(item:Requisition):void {
        this.reqItem = item;
        // checking status
        if(this.isFormCompleted(item)) {
            this.renderMode = "dispform";
        }else if(this.isFormReturned(item)) {
            this.renderMode = "newform";
        }else {
            this.checkAdminPermission(item);
        }
        console.log(item);
    }
    renderDispForm(item:Requisition):void {
        this.renderMode = "dispform";
        this.reqItem = item;
        console.log(item);
    }
    renderViewAll(): void {
        this.renderMode = "viewall";
    }
    renderAdmin():void {
        this.renderMode = "admin";
    }
    renderBI():void {
        this.renderMode = "bi";
    }

    // checking if the current user is in admin group
    private isCurUserAdmin(): boolean {
        let isReqAdmin:boolean = this.curUser.SPGroups.indexOf("Requisition Admin members") > -1;
        return isReqAdmin;
    }
    private isFormCompleted(item:Requisition): boolean {
        if(item.RequestStatus === FormStatus[FormStatus.Completed] ||
            item.RequestStatus === FormStatus[FormStatus.Rejected]) {
                return true;
            }
        return false;
    }
    private isFormReturned(item: Requisition): boolean {
        return item.RequestStatus === FormStatus[FormStatus.Returned];
    }
    checkAdminPermission(spItem:Requisition):void {
        try {
            let officeName:string = spItem.Office;
            let office:Office = this.appConfig.offices.filter(off => off.name.toLowerCase() === officeName.toLowerCase())[0];
            
            let adminGroup:string = office.admingroup;
            this.spService.isUserInGroup(adminGroup,this.curUser)
                .subscribe(confirmed => {
                    this.isAdmin = confirmed;
                    if(this.isAdmin) {
                        this.renderMode = "editform";
                    }else {
                        this.checkApprovalPermission(spItem, office);
                    }
                });
        } catch (error) {
            this.isAdmin = false;
            this.renderMode = "dispform";
            console.error("Error in CheckAdminPermission",error);
        }
    }

    checkApprovalPermission(spItem:Requisition, office:Office):void {
        let approvalIndex = spItem.ApprovalStage;
        let approvalLevel:ApprovalLevel = office.approvalMatrix[approvalIndex];
        if(approvalLevel.name === "Manager") {
            this.renderMode = this.curUser.AccountName.toLowerCase() === spItem.Manager.toLowerCase()? "editform": "dispform";
        }else {
            this.spService.isUserInGroup(approvalLevel.approvalGroup,this.curUser)
                .subscribe(found => {
                    this.renderMode = found? "editform": "dispform";
                });
        }
    }
 }
