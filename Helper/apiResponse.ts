import { Injectable } from '@nestjs/common';
import { ApiResponseEnum } from './../enums/ApiResponse';
@Injectable()
export class ApiResponse {
   success(message: string = '', data: any = [], code: number = 200): any {
    const response = {
      code: code,
      status: ApiResponseEnum.StatusSuccess,
      message: message,
      result: {
        data: data,
      },
    };

    return response;
  }

   failure(message: string = '', data: any = [], code: number = 400): any {
    const response = {
      code: code,
      status: ApiResponseEnum.StatusFailed,
      message: message,
      result: {
        data: data,
      },
    };

    return response;
  }

   exceptionResponse(exception: any): any {
    console.log(exception.message);

    return {
      status: ApiResponseEnum.StatusFailed,
      message: 'An unexpected error was encountered. Please contact the Admin.',
      result: {
        data: null,
      },
      error: exception.message,
    };
  }
}