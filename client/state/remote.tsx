import React, { createContext, Reducer, useContext, useReducer } from "react";
import { useClient } from "../qwantify";
import { EVENT } from "../qwantify/events";
import { Member } from "../qwantify/types";
import { get } from "../utils/localStorage";
import { BaseContext } from "./base";

const getKeyboardModifierState = (capsLock: boolean, numLock: boolean, scrollLock: boolean) => {
    return Number(capsLock) + 2 * Number(numLock) + 4 * Number(scrollLock);
}
interface RemoteState {
    id: string,
    clipboard: string,
    locked: boolean,
    implicitHosting: boolean,
    keyboardModifierState: number,
}

const initialState: RemoteState = {
    id: '',
    clipboard: '',
    locked: false,
    implicitHosting: true,
    keyboardModifierState: -1,
}

interface ActionType {
    payload?: any;
    type: "SETHOST" | "SETCLIPBOARD" | "SETKEYBOARDMODIFIER" |
    "SETLOCKED" | "SETIMPLICITHOSTING" | "RESET"
}

export const ChatReducer = (state: RemoteState, action: ActionType): RemoteState => {

    const { payload, type } = action;

    switch (type) {
        case "SETHOST":
            const host: string | Member = payload;
            return {
                ...state,
                id: typeof host === "string" ? host : host.id
            };
        case "SETCLIPBOARD":
            const clipboard: string = payload;
            return {
                ...state,
                clipboard
            }
        case "SETKEYBOARDMODIFIER":
            const { capsLock, numLock, scrollLock } = payload
            return {
                ...state,
                keyboardModifierState: getKeyboardModifierState(capsLock, numLock, scrollLock)
            }
        case "SETLOCKED":
            const locked: boolean = payload;
            return {
                ...state,
                locked
            }
        case "SETIMPLICITHOSTING":
            const val: boolean = payload;
            return {
                ...state,
                implicitHosting: val
            }
        case "RESET":
            return {
                ...state,
                id: '',
                clipboard: '',
                locked: false
            }
        default:
            return state;
    }
}

export const RemoteContext = createContext({
    dispatch: (type: ActionType["type"], payload?: any) => { },
    state: initialState,
    changeKeyboard: () => { },
    isHosted: ():boolean => true
});

export default function RemoteProvider({ children }: { children: React.ReactElement }) {

    const [state, dispatch] = useReducer<Reducer<RemoteState, ActionType>>(ChatReducer, initialState)
    const base = useContext(BaseContext);
    const client = useClient();

    const remoteDispatch = (type: ActionType["type"], payload: any) => {
        dispatch({
            type,
            payload
        })
    }

    const isHosted = () => {
        return state.id !== '' || state.implicitHosting
    }

    const changeKeyboard = () => {
        const isHosting = true || state.implicitHosting;
        const keyboard_layout = get<string>('keyboard_layout', 'us')

        if (!base.state.connected || !isHosting) {
            return
        }

        client.sendMessage(EVENT.CONTROL_KEYBOARD, { layout: keyboard_layout })
    }

    return (
        <RemoteContext.Provider
            value={{
                state,
                dispatch: remoteDispatch,
                changeKeyboard,
                isHosted
            }}>
            {children}
        </RemoteContext.Provider>
    )
}