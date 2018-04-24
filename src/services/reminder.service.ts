import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { IReminder } from "../models/definitions";
import { Observer } from "rxjs/Observer";

@Injectable()
export class ReminderService
{
    
    constructor() {
    }

    getReminders() : Observable<IReminder[]> {
        return Observable.create((o: Observer<IReminder[]>) => {
            try {
                let reminders = this.getRemindersFromLocalStorage();
                o.next(reminders);
                o.complete();
            } catch(ex) {
                o.error(ex.message);
                o.complete();
            }
        });
    }

    private getRemindersFromLocalStorage() : IReminder[] {

        let remindersJson = localStorage.getItem('reminders');
        if (!remindersJson)
            return [];

        return JSON.parse(remindersJson);
    }

    private setReminderInLocalStorage(reminders: IReminder[]) {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }

    private getIndex(reminders: IReminder[], id: number) : number {
        let record = reminders.find(t => t.id == id);
        if (!record)
            return -1;

        return reminders.indexOf(record);
    }

    private getNextId(reminders: IReminder[]) : number {
        return reminders.reduce((c, t) => {
            if (t.id > c) 
                return t.id+1;
            return c; 
        }, 1);
    }

    remove(reminder: IReminder): Observable<boolean> {
        return Observable.create(o => {
            this.getReminders().subscribe(reminders => {
                let newReminders = reminders.filter(t => t.id != reminder.id);
                this.setReminderInLocalStorage(newReminders);
                o.next(true);
                o.complete();
            }, error => {   
                o.error(error);
                o.complete();
            });
        });
    }
    

    saveReminder(reminder: IReminder) : Observable<IReminder> {
        return Observable.create((o: Observer<IReminder>) => {
            this.getReminders()
                .subscribe(
                    reminders => {
                        let index = this.getIndex(reminders, reminder.id);
                        if (index == -1) { 
                            if (!reminder.id)
                                reminder.id = this.getNextId(reminders);
                                
                            reminders.push(reminder);
                        } else {
                            reminders[index] = reminder;
                        }

                        this.setReminderInLocalStorage(reminders);
                        o.next(reminder);
                        o.complete();
                    },
                    error => {
                        o.error(error);
                        o.complete();
                    }
                );
        });
    }
}