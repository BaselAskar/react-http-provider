# react-http-provider
<h2>Library for Managing http requests with authentication API</h2>

<h3 style=color:#BC3433;font-weight:bold;>Requires ...</h3>
<ul>
  <li>react >= 18</li>
  <li>react-redux >= 18</li>
  <li>@reduxjs/toolkit > 1.9</li>
</ul>

## Installation
write this command after download requires packages
```bash
npm install --save react-http-provider
```

## Usage
for using the library after install the package you should follow theses steps

### 1 - create store file for storing authentication states and use { authStoreBuilder } to build the store

```javascript
import {authStoreBuilder} from 'react-http-provider';

const {AuthProvider,loginAction,logoutAction,useAuthDispatch,useAuthStore} = authStoreBuilder<{id:string,userName:string,token:string}>({
  getToke() {
    return localStorage.getItem('token');
  },
  removeToken(){
    localStorage.removeItem('token');
  },
  setToken(token) {
    localStorage.setItem('token',token);
  },
});


export {
  AuthProvider,
  loginAction,
  logoutAction,
  useAuthDispatch,
  useAuthStore
}
```

### 2 - create useHttp file to build custome http hook
```javascript
import { logoutAction, useAuthDispatch } from "auth/store";
import { httpProviderBuilder } from "react-http-provider";


const useHttp = httpProviderBuilder({
  baseUrl:'https://localhost:7160',
  defaultApplyError(error){
    console.error(error);
  },
  getToken(){
    return localStorage.getItem('token');
  },
  refreshToken(respones) {
    
  },
  dispatchHook:useAuthDispatch,
  logoutAction:logoutAction
});

export default useHttp;
```

