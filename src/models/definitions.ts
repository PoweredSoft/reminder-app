
export enum ReminderType
{
    Complex = 1
}

export enum IntervalType {
    Minute,
    Hour
}

export interface IReminder
{
    id?: number;
    name?: string;
    type?: ReminderType;
    message?: string;
}

export interface IReminderSimple extends IReminder
{
    date?: Date;
}

export interface IReminderComplex extends IReminder
{
    sunday?: boolean;
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday? :boolean;
    fromTime?: Date;
    toTime?: Date;
    intervalType?: IntervalType;
    interval?: number;
}

