import { Observable } from "rxjs/Observable";
import pnp from "sp-pnp-js";
import { Requisition } from "./../models/requisition";
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { Injectable, Inject } from "@angular/core";
import { AppContextToken, Employee } from "../models/requisition";

@Injectable()
export class SPService {
    _wpContext:IWebPartContext;
    constructor(@Inject(AppContextToken) wpContext:IWebPartContext) {
        this._wpContext = wpContext;
    }

    // add new requisition to SP list
    addRequisition(spItem:Requisition,attachment:File): Observable<boolean> {
        return Observable.create(observer => {
            pnp.sp.web.lists.getByTitle("Requisitions").items.add(spItem)
            .then(item => {
                console.log("item added");
                if(attachment) {
                    item.item.attachmentFiles.add(attachment.name,attachment)
                        .then( v => {
                            console.log("attachment is added");
                            observer.next(true);
                            observer.complete();
                        });
                }else {
                    observer.next(true);
                    observer.complete();
                }
            }).catch( error => {
                console.log(error);
                observer.error(error);
                observer.complete();
            });
        });
    }

    // update a requisition item to SP list
    updateRequisition(spItem: Requisition): Observable<boolean> {
        return Observable.create( observer => {
            pnp.sp.web.lists.getByTitle("Requisitions").items.getById(spItem.ID)
            .update(spItem)
            .then(item => {
                console.log("item updated");
                observer.next(true);
                observer.complete();
            }).catch( error => {
                console.log(error);
                observer.error(error);
                observer.complete();
            });
        });
    }

    // load all items
    loadAllRequisitions(): Observable<Requisition[]> {
        return Observable.create( observer => {
            let cutoffDate: Date = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 365);
            pnp.sp.web.lists.getByTitle("Requisitions").items
                .filter("SubmitDate ge datetime'" + cutoffDate.toISOString() + "'")
                .orderBy("SubmitDate",false)
                .get()
                .then( data => {
                    if(data instanceof Array) {
                        let reqs:Requisition[] = data.map(req => this.convertToRequisitionObj(req));
                        observer.next(reqs);
                    }else {
                        observer.next([]);
                    }
                    observer.complete();
                }).catch(error => {
                    console.error("error in loadAllRequisitions",error);
                });
        });
    }

    // load requisition items
    // .filter("AuthorId eq " + userId)
    loadMyRequisitions(emp: Employee): Observable<Requisition[]> {
        return Observable.create( observer => {
            let cutoffDate:Date = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 365);
            pnp.sp.web.lists.getByTitle("Requisitions").items
                // .filter("RequestStatus ne 'Completed' and RequestStatus ne 'Rejected'")
                .filter("SubmitDate ge datetime'" + cutoffDate.toISOString()  + "'")
                .orderBy("SubmitDate",false)
                .get()
                .then( data => {
                    if(data instanceof Array) {
                        // get my requisitions
                        let myItems:Requisition[] = this.getItemsCreatedByMe(data,emp.UserId);
                        observer.next(myItems);
                        let myApprovals:Requisition[] = this.getItemsPendingMyApproval(data,emp);
                        observer.next(myApprovals);
                        let myApprovableItems:Requisition[] = this.getHRApprovableRequests(data,emp);
                        observer.next(myApprovableItems);
                    }else {
                        observer.next([]);
                    }
                    observer.complete();
                }).catch(error => {
                    console.log(error);
                });
        });
    }

    // using pnp promise
    loadRequisitionUsingPnp(emp: Employee): Promise<any> {
        return pnp.sp.web.lists.getByTitle("Requisitions").items.get();
    }

    isUserInGroup(groupName:string, user:Employee): Observable<boolean> {
        return Observable.create(observer => {
            pnp.sp.web.siteGroups.getByName(groupName).users.get()
                .then(data => {
                    let matchedUsers = data.map(u => user.UserId === u.Id);
                    observer.next(matchedUsers.length > 0);
                    observer.complete();
                    console.log(data);
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }

    

    getItemsCreatedByMe(data:Array<any>, userId:number): Requisition[] {
        let reqs: Requisition[] = new Array();
        data.forEach(item => {
            if(item.AuthorId === userId) {
                reqs.push(this.convertToRequisitionObj(item));
            }
        });
        return reqs;
    }

    isMyApprovalItem(obj:any, emp:Employee): boolean {

        if(obj.ApprovalStage === "0" && emp.AccountName === obj.Manager) {
            return true;
        }else if (emp.SPGroups.indexOf(obj.PendingApprovalGroup) > -1) {
            return true;
        }
        return false;
    }
    getItemsPendingMyApproval(data:Array<any>, emp: Employee):Requisition[] {
        let reqs:Requisition[] = new Array();
        data.forEach(item => {
            let myHRGroup: string = item.Office.toLowerCase() + "hr members";
            if(item.RequestStatus === "Completed" || item.RequestStatus === "Rejected") {
                return;     // ~ continue to next iteration
            }
            if(item.ApprovalStage === "0" && emp.AccountName === item.Manager) {
                reqs.push(this.convertToRequisitionObj(item));
            }else if (emp.SPGroups.indexOf(item.PendingApprovalGroup) > -1) {
                reqs.push(this.convertToRequisitionObj(item));
            }else if( emp.SPGroups.indexOf(myHRGroup) > -1) {
                reqs.push(this.convertToRequisitionObj(item));
            }
        });
        return reqs;
    }
    getHRApprovableRequests(data:Array<any>, emp: Employee):Requisition[] {
        let reqs: Requisition[] = new Array();
        let myGroups: string[] = emp.SPGroups.map( ele => ele.toLowerCase());
        data.forEach( item => {
            let myHRGroup: string = "requisition " + item.Office.toLowerCase() + " hr members";
            if(item.RequestStatus === "Completed" || item.RequestStatus === "Rejected"
                || item.RequestStatus === "Returned") {
                return;     // ~ continue to next iteration
            }
            if(item.ApprovalStage === "0" && emp.AccountName === item.Manager) {
                return;     // this is under my direct pending approval
            }else if (emp.SPGroups.indexOf(item.PendingApprovalGroup) > -1) {
                return;     // this is listed directly under my pending approval
            }else if (myGroups.indexOf(myHRGroup) > -1) {       // case insensitive check
                reqs.push(this.convertToRequisitionObj(item));
            }
        });
        return reqs;
    }
    convertToRequisitionObj(obj:any):Requisition {
        return {
            ID: obj.ID|| "",
            Title: obj.Title|| "",
            EmployeeName: obj.EmployeeName|| "",
            EmployeeEmail: obj.EmployeeEmail|| "",
            EmployeeTitle: obj.EmployeeTitle|| "",
            Department: obj.Department|| "",
            Manager: obj.Manager|| "",
            Office: obj.Office|| "",
            Category: obj.Category|| "",
            SubCategory: obj.SubCategory|| "",
            SubmitDate: obj.SubmitDate,
            Amount: obj.Amount || 0,
            Description: obj.Description|| "",
            RequestStatus: obj.RequestStatus|| "",
            ApprovalStage: obj.ApprovalStage|| "",
            PendingApprovalGroup: obj.PendingApprovalGroup || "",
            ApprovalComment: obj.ApprovalComment|| ""
        };
    }
}