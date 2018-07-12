import { HttpRequest } from '@angular/common/http';
import * as isEqual from 'lodash.isequal';


interface HttpRequestMatchObj {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: { [key: string]: string };
    body?: any;
    headers?: { [key: string]: string };
}


export function httpRequestMatch(match: HttpRequestMatchObj): (request: HttpRequest<any>) => boolean {

    return (request: HttpRequest<any>): boolean => {
        expect(request.url).toEqual(match.url);
        expect(request.method).toEqual(match.method);

        let isAllParameterMatched = true;
        let isAllBodyMatched = true;
        let isAllHeaderMatched = true;

        if (match.params) {
            Object.keys(match.params).forEach((name) => {
                expect(request.params.get(name)).toEqual(match.params[name]);
                isAllParameterMatched = isAllParameterMatched
                    && (request.params.get(name) === match.params[name]);
            });
        }

        if (match.body) {
            expect(isEqual(request.body, match.body)).toBeTruthy();
            isAllBodyMatched = isEqual(request.body, match.body);
        }

        if (match.headers) {
            Object.keys(match.headers).forEach((name) => {
                expect(request.headers.get(name)).toEqual(match.headers[name]);
                isAllHeaderMatched = isAllHeaderMatched
                    && (request.headers.get(name) === match.headers[name]);
            });
        }

        return request.url === match.url
            && request.method === match.method
            && isAllParameterMatched
            && isAllBodyMatched
            && isAllHeaderMatched;
    };
}
