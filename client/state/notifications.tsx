import React, { createContext, Reducer, useReducer } from "react";

type notifs = {
    type: "info" | "warning" | "error" | "success"
    title: string
    text?: string
}

type events = {
    text?: string
    type: "info" | "error"
    title: string
}

interface NotificationState {
    type?: "notification" | "event"
    event?: events
    notification?: notifs
}
const initialState: NotificationState = {
    type: undefined,
    event: undefined,
    notification: undefined
}

interface ActionType {
    type: "notification" | "message";
    payload: any;
}

const NotificationReducer = (state: NotificationState, action: ActionType) => {
    const { payload, type } = action

    switch (type) {
        case "message":
            //TODO: subscribe to msgs here
            return state
        case "notification":
            //TODO: subscribe to notifs here
            return state
        default:
            return state;
    }
};

export const NotificationContext = createContext({
    eventify: (e:events) => { },
    notify: (n:notifs) => { }
})

export default function NotificationProvider({ children }: { children: React.ReactElement }) {
    const [state, dispatch] = useReducer<Reducer<NotificationState, ActionType>>(NotificationReducer, initialState)

    const notify = ({type,text,title}:notifs) => {
        dispatch({
            type: "notification",
            payload: {
                type,
                text,
                title
            }
        })
    }
    const eventify = ({type,text, title}:events) => {
        dispatch({
            type: "message",
            payload: {
                type,
                text,
                title
            }
        })
    }

    return (
        <NotificationContext.Provider
            value={{
                eventify,
                notify
            }}>
            {children}
        </NotificationContext.Provider>
    )
}