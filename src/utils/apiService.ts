// import axios, { AxiosInstance, CancelTokenSource } from 'axios'
// import * as rax from 'retry-axios'

// export class APIService {
//   private static _instance: AxiosInstance
//   private static _idToken: string
//   private static _cancelTokenSource = axios.CancelToken.source()

//   constructor(idToken: string, callback: () => Promise<{ idToken: string }>) {
//     APIService._instance = axios.create()
//     rax.attach(APIService._instance)

//     APIService._idToken = idToken
//     APIService.updateRequestInterceptor()

//     ;(APIService._instance.defaults as unknown as rax.RaxConfig).raxConfig = {
//       retry: 3,
//       instance: APIService._instance,
//       httpMethodsToRetry: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
//       statusCodesToRetry: [[401]],
//       retryDelay: 100,

//       onRetryAttempt: async (err) => {
//         var res = await callback()
//         APIService.updateTokens(res.idToken)
//         APIService._instance.interceptors.request.clear()
//         APIService.updateRequestInterceptor()
//       },
//     }
//   }

//   public static getInstance(): AxiosInstance {
//     return APIService._instance
//   }

//   public static getCancelToken() {
//     return APIService._cancelTokenSource
//   }

//   public static updateCancelToken(): CancelTokenSource {
//     APIService._cancelTokenSource = axios.CancelToken.source()
//     return APIService._cancelTokenSource
//   }

//   private static updateTokens(idToken: string) {
//     APIService._idToken = idToken
//   }

//   private static updateRequestInterceptor() {
//     APIService._instance.interceptors.request.use(
//       (config) => {
//         // config.headers.set("Authorization", "Bearer " + APIService._idToken);
//         // config.headers['x-jwt-assertion'] = APIService._idToken

//         return config
//       },
//       (error) => {
//         Promise.reject(error)
//       },
//     )
//   }
// }

import axios, { AxiosInstance } from 'axios';

export class APIService {
  private static _instance: AxiosInstance;

  // Initialize the instance statically to avoid re-initializing
  static initialize(baseURL: string) {
    if (!APIService._instance) {
      APIService._instance = axios.create({
        baseURL: baseURL,
        timeout: 10000, // Increased default timeout to 10 seconds
      });
    }
  }

  // Get the shared axios instance
  public static getInstance(): AxiosInstance {
    if (!APIService._instance) {
      throw new Error('APIService not initialized. Call initialize() first.');
    }
    return APIService._instance;
  }

  // Helper method to create requests with custom timeout
  public static createRequestWithTimeout(timeout: number = 10000) {
    const instance = APIService.getInstance();
    return {
      get: (url: string, config?: any) => instance.get(url, { ...config, timeout }),
      post: (url: string, data?: any, config?: any) => instance.post(url, data, { ...config, timeout }),
      put: (url: string, data?: any, config?: any) => instance.put(url, data, { ...config, timeout }),
      delete: (url: string, config?: any) => instance.delete(url, { ...config, timeout }),
    };
  }
}
