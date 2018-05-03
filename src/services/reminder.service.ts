import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { IReminder, ReminderType, IReminderComplex, IntervalType } from "../models/definitions";
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";
import { moment, Khronos } from "ngx-bootstrap/chronos/test/chain";
import { start } from "repl";
import { Moment } from "moment";

@Injectable()
export class ReminderService
{
    protected _reminders: IReminder[] = [];
    protected _subjectReminder: Subject<IReminder> = null;
    protected _latestRemindings: Array<{ reminderId: number, lastTime: Date }> = [];

    constructor() {
        this.refreshReminderPlanning();
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
        this.refreshReminderPlanning();
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

    get subjectReminder() : Observable<IReminder> {

        if (!this._subjectReminder) {
            this._subjectReminder = new Subject<IReminder>();
        }

        return this._subjectReminder.asObservable();
    }
    
    protected isActivatedToday(reminder: IReminderComplex, now: Date): boolean {
        let dayIndex = now.getDay();
        if (dayIndex == 0 && reminder.sunday) return true;
        if (dayIndex == 1 && reminder.monday) return true;
        if (dayIndex == 2 && reminder.tuesday) return true;
        if (dayIndex == 3 && reminder.wednesday) return true;
        if (dayIndex == 4 && reminder.thursday) return true;
        if (dayIndex == 5 && reminder.friday) return true;
        if (dayIndex == 6 && reminder.saturday) return true;
        return false;
    }

    protected intervalTypeToMomentIntervalString(intervalType: IntervalType) : "hours" | "minutes" 
    {
        let intervalTypeString: "hours" | "minutes" = 'hours';
        if (intervalType == IntervalType.Minute)
            intervalTypeString = 'minutes';

        return intervalTypeString;
    }

    protected setLatestReminder(reminder: IReminder, now: Khronos) {
        let latestReminder = this._latestRemindings.find(t => t.reminderId == reminder);
        if (latestReminder)
            latestReminder.lastTime = now._date;
        else
            this._latestRemindings.push({
                reminderId: reminder.id,
                lastTime: now._date
            });
    }

    protected getCurrentComplexReminder(reminder: IReminderComplex, now: Khronos) : Khronos {

        let dateStr = moment().format('YYYY-MM-DD');
        let fromStr = moment(reminder.fromTime).format('HH:mm');
        let toStr = moment(reminder.toTime).format('HH:mm');

        let startTime = moment(`${dateStr} ${fromStr}`, 'YYYYY-MM-DD HH:mm');
        let endTime = moment(`${dateStr} ${toStr}`, 'YYYYY-MM-DD HH:mm');

        let intervalType = this.intervalTypeToMomentIntervalString(reminder.intervalType);
        let timeTable = [];
        for(let it = moment(startTime) ; it.isSameOrBefore(endTime) ; it.add(reminder.interval, intervalType)) {
            if (moment.duration(it.diff(now)).as('seconds') < 58)
                timeTable.push(moment(it));
        }
        
        let time = timeTable.reverse().find(t => t.isSameOrBefore(now));
        return time;
    }

    protected handleComplexReminder(reminder: IReminderComplex) : boolean {

        let now = moment();

        if (!this.isActivatedToday(reminder, now._date))
            return false;

        let intervalTypeString = this.intervalTypeToMomentIntervalString(reminder.intervalType);
        let startTime = moment(moment(reminder.fromTime).format('HH:mm'), 'HH:mm').subtract(3, "seconds");
        let endTime = moment(moment(reminder.toTime).format('HH:mm'), 'HH:mm').add(3, "seconds");
        let nowTime = moment(now.format('HH:mm'), 'HH:mm');

        if (!nowTime.isBetween(startTime, endTime)) 
            return false;      

        let currentReminder = this.getCurrentComplexReminder(reminder, now);
        if (currentReminder) {

            let diff = now.diff(currentReminder);
            let duration = moment.duration(diff);
            let secondsDifference = duration.as('seconds');
            if (secondsDifference > 3) 
                return false;

            let latestReminder = this._latestRemindings.find(t => t.reminderId == reminder.id);
            if (!latestReminder) {
                this.setLatestReminder(reminder, now);
                return true;
            } else {
                let diff = moment.duration(now.diff(latestReminder.lastTime));
                let secondsSince = diff.as('seconds');
                if (secondsSince > 3) {
                    this.setLatestReminder(reminder, now);
                    return true;
                }
            }

        }

        

        return false;
    }

    protected refreshReminderPlanning() {

        setInterval(() => {
    
            
            let remindersToShow = this._reminders.filter(reminder => {
                if (reminder.type == ReminderType.Complex) 
                    return this.handleComplexReminder(reminder as IReminderComplex);
                
                return false;
            }).forEach(reminder => {
                
                Notification.requestPermission(status => {
                    let notification = new Notification(reminder.name, {
                        body: reminder.message
                    });
                });
            });

        }, 1000);

        this.getReminders().subscribe(reminders => {
            this._reminders = reminders;
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