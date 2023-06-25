import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

@Injectable()
export class AxiosInterceptor {
  mongoDBUrl: string;
  constructor() {
    this.mongoDBUrl = process.env.MONGODB_LOGGER_URL;
    this.initializeInterceptor();
    this.connectToMongoDB();
  }

  initializeInterceptor() {
    axios.interceptors.request.use(
      (config: any) => {
        // Store the request data in MongoDB
        const requestTime = new Date().getTime();
        config.metadata = { requestTime, apiProviderName: config.apiProviderName };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    axios.interceptors.response.use(
      (response: any) => {
        // Store the response data in MongoDB along with time taken
        const responseTime = new Date().getTime();
        const { config, data, status } = response;
        const { requestTime, apiProviderName } = config.metadata;
        const timeTaken = responseTime - requestTime;

        this.storeRequestAndResponse(config, data, status, timeTaken, apiProviderName);

        return response;
      },
      (error) => {
        // Store the response error data in MongoDB
        const { config, response } = error;
        const { data, status } = response;
        const { requestTime, apiProviderName } = config.metadata;
        const timeTaken = new Date().getTime() - requestTime;

        this.storeRequestAndResponse(config, data, status, timeTaken, apiProviderName);

        return Promise.reject(error);
      },
    );
  }

  async connectToMongoDB() {
    try {
      mongoose.set('strictQuery', false);
      mongoose.set('debug', true);
      await mongoose.connect(this.mongoDBUrl);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  storeRequestAndResponse(config, responseData, status, timeTaken, apiProviderName) {
    const RequestResponseModel = mongoose.model(
      'RequestResponse',
      new mongoose.Schema({
        url: String,
        method: String,
        headers: Object,
        requestData: Object,
        responseData: Object,
        status: Number,
        timeTaken: Number,
        apiProviderName: String,
        timestamp: { type: Date, default: Date.now },
      }),
    );

    const requestResponse = new RequestResponseModel({
      url: config.url,
      method: config.method,
      headers: config.headers,
      requestData: config.data,
      responseData,
      status,
      timeTaken,
      apiProviderName,
    });

    requestResponse.save();
  }
}
