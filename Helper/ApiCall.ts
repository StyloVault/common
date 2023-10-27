import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { AppConfig } from './../../config.schema';
import { RequestObject } from './RequestObject';

@Injectable()
export class ApiCall {
    
  protected accessToken : string;
  protected headers : {};
 
  async transport(request : RequestObject) {
   
     (await this.setToken(request)).setHeaders();

     try {
        const {status, data} = await axios({
          method : request.method,
          url: request.url,
          data: request.body,
          headers : this.headers,
        });
        return { status, data };
      } catch (error) {
        const { status, data } = error.response;
        return { status, data };
      }
  }

  private async setToken(request : RequestObject) {

    const payload = {
        sID: request.userId,
        userRole: request.userRole,
        usage: 'TRANSPORT',
      };
  
      this.accessToken = await jwt.sign(payload, AppConfig.JWT_SECRET, {
        expiresIn: '15m',
      });

      return this
  }

   private setHeaders() {
    this.headers =   {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      };
  } 
}