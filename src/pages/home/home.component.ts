import { Component, OnInit } from "@angular/core";
import { IReminder, ReminderType, IReminderComplex, IntervalType, IReminderSimple } from "../../models/definitions";
import { ReminderService } from "../../services/reminder.service";

@Component({
    selector: 'page-home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    currentlyEditing: IReminder;
    public intervalTypes: { value: IntervalType; text: string; }[];
    public reminders: IReminder[];

    

    public constructor(protected reminderService: ReminderService) {

    }

    protected refreshReminders () {
        this.reminderService.getReminders().subscribe(reminders => {
            this.reminders = reminders;
        });
    }

    ngOnInit(): void {
        this.refreshReminders();
    }   

    newReminder() {
        if (this.currentlyEditing)
            return;

        let newOne: IReminderComplex = {
            id: null,
            type: ReminderType.Complex,
            name: 'new reminder'
        };

        this.reminders = [newOne].concat(this.reminders);
        this.currentlyEditing = newOne; 
    }
    
    onReminderCancel(reminder: IReminder) {
        this.reminders = this.reminders.filter(t => t.id);
        this.currentlyEditing = null;
    }
    
    onReminderDelete(reminder: IReminder) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            this.reminderService.remove(reminder).subscribe(res => {
                this.refreshReminders();
            });
        }
    }

    onReminderStartEdit(reminder: IReminder) {

        if (this.currentlyEditing)
            return false;
        
        this.currentlyEditing = reminder;
        return true;
    }
    
    onReminderSave(reminder: IReminder) {
        this.reminderService.saveReminder(reminder).subscribe(savedResult => {
            this.currentlyEditing = null;
            this.refreshReminders();
        });
    }
}