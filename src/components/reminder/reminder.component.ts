import { Component, Input, OnInit } from "@angular/core";
import { IReminder, ReminderType, IReminderSimple, IReminderComplex, IntervalType } from "../../models/definitions";
import * as moment from 'moment';

@Component({
    selector: 'reminder',
    templateUrl: './reminder.component.html'
})
export class ReminderComponent implements OnInit {

 
    intervalTypes: { value: IntervalType; text: string; }[];

    public complexType = ReminderType.Complex;
    public simpleType = ReminderType.Simple;
    
    @Input()
    reminder: IReminder;

    @Input()
    onSave: any;

    @Input()
    onCancel: any;

    @Input()
    onStartEdit: any;

    @Input()
    onDelete: any;

    editing: IReminder = null;

    public constructor() {

        this.intervalTypes = [
            { value: IntervalType.Hour, text: "Hours" },
            { value: IntervalType.Minute, text: "Minutes "} 
        ];
    }

    ngOnInit(): void {
        if (!this.reminder.id)
            this.editing = this.reminder;
    }

    removeMe() {
        if (this.onDelete)
        this.onDelete(this.reminder);
    }

    startEdit() {

        if (this.editing)
            return;

        if (!this.onStartEdit || this.onStartEdit(this.reminder))
            this.editing = {...this.reminder};
    }

    cancel() {

        if (this.onCancel)
            this.onCancel(this.editing);

        this.editing = null;
    }

    save() {
        if (this.onSave)
            this.onSave(this.editing);
    }

    get summary(): string {
        let ret = ``;

        if (this.reminder.type == ReminderType.Simple) {

            let simpleReminder = this.reminder as IReminderSimple;
            ret += `${moment(simpleReminder.date).format('DD MMM YYYY  h:mm:ss A ')}`;
        } else {
            let complexReminder = this.reminder as IReminderComplex;

        
            let daysStr = [];

            if (complexReminder.sunday)
                daysStr.push('Sun');
            if (complexReminder.monday)
                daysStr.push('Mon');
            if (complexReminder.tuesday)
                daysStr.push('Tue');
            if (complexReminder.wednesday)
                daysStr.push('Wed');
            if (complexReminder.thursday)
                daysStr.push('Thu');
            if (complexReminder.friday)
                daysStr.push('Fri');
            if (complexReminder.saturday)
                daysStr.push('Sat');

            ret += daysStr.join(',');

            let fromStr = moment(complexReminder.fromTime).format('h:mm A');
            let toStr = moment(complexReminder.toTime).format('h:mm A');
            ret += ` from ${fromStr} to ${toStr}`;

            if (complexReminder.intervalType == IntervalType.Hour) {
                ret += ` every ${complexReminder.interval} hours`;
            } else if (complexReminder.intervalType == IntervalType.Minute) {
                ret += ` every ${complexReminder.interval} minutes`;
            }

           
        }

        return ret;
    }
}