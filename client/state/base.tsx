import React, { Reducer } from 'react';
import { useClient } from '../qwantify';
import { get, set } from '../utils/localStorage';

interface Props {
    children: React.ReactElement;
};

type InitState = {
    displayname: string,
    password: string,
    active: boolean,
    connecting: boolean,
    connected: boolean,
    locked: Record<string, boolean>,
}
const initialState = {
    displayname: get<string>('displayname', ''),
    password: get<string>('password', ''),
    active: false,
    connecting: false,
    connected: false,
    locked: {} as Record<string, boolean>,
};

type ActionType = {
    type: 'SETACTIVE' | 'SETLOGIN' | 'SETLOCKED' | 'SETUNLOCKED' | 'SETCONNECTING' |
    'SETCONNECTING' | 'SETCONNECTED'
    payload: any
}
const initReducer = (state: InitState, action: ActionType): InitState => {
    const { type, payload } = action;
    switch (type) {
        case 'SETACTIVE':
            return {
                ...state,
                active: true
            }
        case 'SETLOGIN':
            const { displayname, password }: { displayname: string, password: string } = payload;
            return {
                ...state,
                displayname,
                password
            }
        case 'SETLOCKED':
            //Vue.set(state.locked, payload.resource, true)
            return { ...state }
        case 'SETUNLOCKED':
            //Vue.set(state.locked, payload.resource, false)
            return { ...state }
        case 'SETCONNECTING':
            return {
                ...state,
                connecting: true,
                connected: false
            }
        case 'SETCONNECTED':
            const connected: boolean = payload;
            if (connected) {
                set('displayname', state.displayname)
                set('password', state.password)
            }

            return {
                ...state,
                connected: connected,
                connecting: false,
            }
        default:
            return state;
    }

}

export const BaseContext = React.createContext({
    state: initialState,
    dispatch: (type: ActionType["type"], payload?: any) => { },
    logout: () => { }
});

export default function BaseContextProvider({ children }: Props) {
    const [state, dispatch] = React.useReducer<Reducer<InitState, ActionType>>(initReducer, initialState)
    const client = useClient()

    const baseDispatch = (type: ActionType["type"], payload: any) => {
        dispatch({
            type,
            payload
        })
    }
    const logout = () => {
        dispatch({
            type: "SETLOGIN",
            payload: {
                displayname: "",
                pasword: ""
            }
        })
        set('displayname', '')
        set('password', '')
        //$client.logout
        client.logout()
    }

    return (
        <BaseContext.Provider
            value={{
                logout,
                state,
                dispatch: baseDispatch
            }}>
            {children}
        </BaseContext.Provider>
    )
}