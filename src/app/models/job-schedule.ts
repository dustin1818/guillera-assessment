export interface JobSchedule {
    id: string;
    address: string;
    employeeName: string;
    position: string;
    scheduleTime: {
        start: string;
        end: string;
    };
    date: string;
    color: string;
}