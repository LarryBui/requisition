import { IOffices } from "./requisition";
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { InjectionToken } from "@angular/core";

export class Requisition {
    ID?: number;
    Title: string;
    EmployeeName: string;
    EmployeeEmail: string;
    EmployeeTitle: string;
    Department: string;
    Manager?: string;
    Office: string;
    Category: string;
    SubCategory: string;
    SubmitDate?: string;
    Amount: string;
    Description: string;
    PendingApprovalGroup?: string;
    RequestStatus: string;      // submitted, in progress, completed, returned,rejected...
    ApprovalStage?: string;
    ApprovalComment: string;
}
export let AppContextToken: InjectionToken<IWebPartContext> = new InjectionToken<IWebPartContext>("WPcontext");
export type RenderModes = "view" |"newform" | "editform" | "dispform" | "viewall" | "admin" | "bi";
export const UPProperties:string[] = ["AccountName","PreferredName","Title","WorkEmail","Department","Manager"];
export enum FormStatus {
    Submitted,Approved,Rejected,Returned,Completed,InProgress,"Re-submitted"
}

export class Employee {
    UserId?: number;
    PreferredName: string;
    WorkEmail: string;
    AccountName: string;
    Title: string;
    Department: string;
    Manager: string;
    SPGroups?: string[];
}

export class ApprovalLevel {
    name: string;
    query: string;
    approvalGroup?: string;
}

export class Office {
    name?: string;
    displayName: string;
    admingroup: string;
    approvalMatrix: ApprovalLevel[];
}
export class Department {
    name?: string;
    displayName: string;
}
export class RequisitionType {
    name?: string;
    displayName: string;
    subTypes: ReqSubType[];
}
export class ReqSubType {
    name?: string;
    displayName?: string;
}
export class AppConfig {
    daterange: string;
    types: RequisitionType[];
    offices: Office[];
}

export interface IOffices {
    [key:string]: Office;
}
export interface IDepartments {
    [key:string]: Department;
}
export interface IRequisitionTypes {
    [key:string]: RequisitionType;
}
export interface IReqSubTypes {
    [key:string]: string;
}

export const appConfig: AppConfig = {
    daterange: "365",
    types: [
       {
            name: "hr",
            "displayName": "Human Resources",
            "subTypes": [
                {
                    name: "businesscards",
                    displayName: "Business Cards"
                },
                {
                    name: "insurance",
                    displayName: "Insurance"
                },
                {
                    name: "ira",
                    displayName: "IRA"
                },
                {
                    name: "taxforms",
                    displayName: "Tax Forms"
                },
                {
                    name: "expenseauthorization",
                    displayName: "Expense Authorization"
                }
            ]
        },
        {
            name: "itsupport", 
            "displayName": "IT Support",
            "subTypes": [
                {
                    name: "accessissues",
                    displayName: "Access Issues"
                },
                {
                    name: "vpn",
                    displayName: "VPN"
                },
                {
                    name: "maintenance",
                    displayName: "Maintenance"
                }
            ]
        },
        {
            name: "purchase",
            "displayName": "Purchase",
            "subTypes": [
                {
                    name: "furniture",
                    displayName: "Furniture"
                }
            ]
        }
    ],
    offices: [
        {
            "name": "Irvine",
            "displayName": "Irvine",
            "admingroup": "Requisition Admin members",
            approvalMatrix:[
                { name: "Manager", query: ""},
                { name: "Exec", query: "250", approvalGroup: "Requisition EXEC members" },
                { name: "HR", query: "", approvalGroup: "Requisition Irvine HR members" }
            ]
        },
        {
            "name": "Lahore",
            "displayName": "Lahore",
            "admingroup": "Requisition Admin members",
            approvalMatrix:[
                { name: "Manager", query: "" },
                { name: "Exec", query: "250", approvalGroup: "Requisition EXEC members" },
                { name: "HR", query: "", approvalGroup: "Requisition Lahore HR members"}
            ]
        },
        {
            "name": "Dubai",
            "displayName": "Dubai",
            "admingroup": "Requisition Admin members",
            approvalMatrix:[
                { name: "Manager", query: ""},
                { name: "Exec", query: "250", approvalGroup: "Requisition EXEC members"},
                { name: "HR", query: "", approvalGroup: "Requisition Dubai HR members" }
            ]
        }
    ]
};
