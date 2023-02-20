"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authStoreBuilder = exports.httpProviderBuilder = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const react_redux_1 = require("react-redux");
const react_1 = __importStar(require("react"));
const APPLICATION_JSON = 'application/json';
const CONTENT_TYPE = 'Content-Type';
const defaultCreateHttp = {
    baseUrl: '',
    defaultApplyError: (error) => { },
    getToken: () => null,
    refreshToken: (res) => { },
    dispatchHook: (react_redux_1.useDispatch),
    logoutAction: () => { },
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
const httpProviderBuilder = function (createHttpParams = defaultCreateHttp) {
    createHttpParams = Object.assign(Object.assign({}, defaultCreateHttp), createHttpParams);
    const { baseUrl, defaultApplyError, getToken, refreshToken, dispatchHook, logoutAction } = createHttpParams;
    return (reqConfig = defaultRequestConfig) => {
        if (!reqConfig.applyError)
            reqConfig.applyError = defaultApplyError;
        reqConfig = Object.assign(Object.assign({}, defaultRequestConfig), reqConfig);
        const dispatch = dispatchHook();
        const logout = () => {
            dispatch(logoutAction());
        };
        const [isLoading, setIsLoading] = (0, react_1.useState)(false);
        const [error, setError] = (0, react_1.useState)(null);
        const sendRequest = (0, react_1.useCallback)(async (params = defaultRequestParams) => {
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
        (0, react_1.useEffect)(() => {
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
exports.httpProviderBuilder = httpProviderBuilder;
const defaultAuthStoreArg = {
    getToke: () => null,
    setToken: (token) => { },
    removeToken: () => { }
};
const authStoreBuilder = function (authBuilderArg = defaultAuthStoreArg) {
    const { getToke, setToken, removeToken } = authBuilderArg;
    const token = getToke();
    const authSlice = (0, toolkit_1.createSlice)({
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
    const authStore = (0, toolkit_1.configureStore)({
        reducer: {
            auth: authSlice.reducer
        }
    });
    const AuthProvider = (props) => react_1.default.createElement((react_redux_1.Provider), { store: authStore, children: props.children });
    const useAuthSelector = react_redux_1.useSelector;
    const useAuthDispatch = (react_redux_1.useDispatch);
    const useAuthStore = () => useAuthSelector(state => state.auth);
    const { login: loginAction, logout: logoutAction } = authSlice.actions;
    return {
        loginAction,
        logoutAction,
        useAuthSelector,
        useAuthDispatch,
        useAuthStore,
        AuthProvider
    };
};
exports.authStoreBuilder = authStoreBuilder;
