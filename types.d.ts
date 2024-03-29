import { Dispatch,AnyAction } from "@reduxjs/toolkit";

export interface HttpBuilder{
  baseUrl:string;
  defaultApplyError:(error:any) => void;
  getToken:() => string | null;
  refreshToken:(respones:Response) => void;
  dispatchHook:() => any;
  logoutAction:() => void;
}





export interface RequestConfi<TData> {
  url: string,
  method?: 'get' | 'post' | 'put' | 'delete',
  header?: Map<string,string>,
  auth?: boolean,
  state?: 'one' | 'multi',
  preventRefreshToken?:boolean,
  applyData : (reponse:HttpResponse<TData>) => void,
  dependinces?: any[],
  applyError?:(error:any) => void
}




export interface RequestParams {
  query?: Object,
  pathParams?: string[],
  body?: object | Array | null
}


export interface HttpResponse<T> {
  data: T,
  status:number,
  statusText:string,
  headers: Headers
}


export interface AuthStoreBuilder {
  getToke:() => string | null;
  setToken:(token:string) => void;
  removeToken:() => void;
}

export interface AuthState {
  isLogin:boolean;
  user:TUser | null;
}


