import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import React, { useState, useCallback, useEffect } from "react";
const APPLICATION_JSON = 'application/json';
const CONTENT_TYPE = 'Content-Type';
const defaultCreateHttp = {
    baseUrl: '',
    defaultApplyError: (error) => { },
    getToken: () => undefined,
    refreshToken: (res) => { },
};
const defaultRequestConfig = {
    url: '',
    method: 'get',
    header: new Map(),
    auth: false,
    state: 'one',
    applyData: (response) => { throw 'you have to provide applyData property ...'; },
    dependinces: [],
};
const defaultRequestParams = {
    query: {},
    pathParams: [],
    body: null,
};
export const httpProviderBuilder = function (createHttpParams = defaultCreateHttp) {
    createHttpParams = Object.assign(Object.assign({}, defaultCreateHttp), createHttpParams);
    const { baseUrl, defaultApplyError, getToken, refreshToken } = createHttpParams;
    return (reqConfig = defaultRequestConfig) => {
        if (!reqConfig.applyError)
            reqConfig.applyError = defaultApplyError;
        reqConfig = Object.assign(Object.assign({}, defaultRequestConfig), reqConfig);
        const logout = () => { };
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);
        const sendRequest = useCallback(async (params = defaultRequestParams) => {
            var _a;
            params = Object.assign(Object.assign({}, defaultRequestParams), params);
            if (isLoading && reqConfig.state === 'one')
                return;
            setIsLoading(true);
            setError(null);
            const variablesInUrl = ((params === null || params === void 0 ? void 0 : params.pathParams) && ((_a = params.pathParams) === null || _a === void 0 ? void 0 : _a.length) > 0) ? '/' + params.pathParams.join('/') : '';
            let queryParams = '';
            if ((params === null || params === void 0 ? void 0 : params.query) && Object.entries(params.query).length > 0) {
                queryParams = '?';
                Object.entries(params.query).forEach(item => {
                    queryParams += `${item[0]}=${item[1]}&`;
                });
                queryParams.slice(-1);
            }
            const reqHeader = new Headers();
            ((params === null || params === void 0 ? void 0 : params.body) && !(params.body instanceof FormData)) && reqHeader.append(CONTENT_TYPE, APPLICATION_JSON);
            if (reqConfig.header) {
                reqConfig.header.forEach((value, key) => {
                    reqHeader.append(key, value);
                });
            }
            if (reqConfig.auth) {
                const jwt = getToken();
                if (!jwt)
                    logout();
                reqHeader.append('Authorization', `Bearer ${jwt}`);
            }
            let bodyBuilder;
            if (params.body) {
                if (reqHeader.get(CONTENT_TYPE) === APPLICATION_JSON) {
                    bodyBuilder = JSON.stringify(params.body);
                }
                else if (params.body instanceof FormData) {
                    bodyBuilder = params.body;
                }
            }
            try {
                const response = await fetch(baseUrl + reqConfig.url + variablesInUrl + queryParams, {
                    method: reqConfig.method.toUpperCase(),
                    headers: reqHeader,
                    body: bodyBuilder,
                });
                if (response.status === 403) {
                    logout();
                }
                if (response.status >= 400) {
                    throw await response.json();
                }
                if (reqConfig.auth) {
                    refreshToken(response);
                }
                let data;
                try {
                    data = (await response.json());
                }
                catch (err) {
                    try {
                        data = (await response.text());
                    }
                    catch (err2) {
                        data = undefined;
                    }
                }
                const httpResponse = {
                    data: data,
                    headers: response.headers,
                    status: response.status,
                    statusText: response.statusText
                };
                reqConfig.applyData(httpResponse);
            }
            catch (error) {
                setError(error);
            }
            finally {
                setIsLoading(false);
            }
        }, [isLoading, reqConfig]);
        useEffect(() => {
            if (error)
                reqConfig.applyError(error);
        }, [error]);
        return {
            sendRequest,
            error,
            isLoading,
        };
    };
};
const defaultAuthStoreArg = {
    getToke: () => undefined,
    setToken: (token) => { },
    removeToken: () => { }
};
export const authStoreBuilder = function (authBuilderArg) {
    const { getToke, setToken, removeToken } = authBuilderArg;
    const token = getToke();
    const authSlice = createSlice({
        name: 'auth',
        initialState: { isLogin: !!token, user: null },
        reducers: {
            login(state, action) {
                setToken(action.payload.token);
                state.user = action.payload;
                state.isLogin = true;
            },
            logout(state) {
                removeToken();
                state.user = null;
                state.isLogin = false;
            }
        }
    });
    const authStore = configureStore({
        reducer: {
            auth: authSlice.reducer
        }
    });
    const AuthProvider = (props) => React.createElement((Provider), { store: authStore, children: props.children });
    const useAuthSelector = useSelector;
    const useAuthDispatch = (useDispatch);
    const useAuthStore = () => useAuthSelector(state => state.auth);
    const { login: loginAction, logout: logoutAction } = authSlice.actions;
    return {
        loginAction,
        logoutAction,
        useAuthSelector,
        useAuthDispatch,
        useAuthStore
    };
};
