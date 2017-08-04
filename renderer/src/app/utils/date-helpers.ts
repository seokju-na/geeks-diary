import * as moment from 'moment';
import { Moment } from 'moment';


export function getFirstDateOfMonth(year: number, month: number): Moment {
    return moment([year, month, 1]);
}

export function copyDate(source: Date | Moment | string): Moment {
    return moment(source);
}

export function unifyDate(source: Date | Moment = moment()): Moment {
    const date = copyDate(source);

    date
        .hour(12)
        .minute(0)
        .second(0)
        .millisecond(0);

    return date;
}
