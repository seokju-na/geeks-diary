import { ErrorHandler } from '@angular/core';
import { logMonitor } from '../../core/log-monitor';


export class GlobalErrorHandler extends ErrorHandler {
    handleError(error: any): void {
        logMonitor.logException(error);
        throw error;
    }
}
