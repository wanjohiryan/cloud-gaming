import React, { Reducer, useReducer } from "react";
import { Member } from "../qwantify/types";

interface Members {
    [id: string]: Member
}

export type UserState = {
    id: string;
    members: Members
}

const initialState = {
    id: '',
    members: {} as Members
};

type ActionType = {
    type: 'SETIGNORED' | 'SETMUTED' | 'SETMEMBERS' | 'SETMEMBER' | 'ADDMEMBER'
    | 'DELMEMBER' | 'RESET'
    payload?: any
}

export const UserReducer = (state: UserState, action: ActionType):UserState => {
    const { type, payload } = action;

    switch (type) {
        case 'SETIGNORED':
            const { id, ignored }: { id: string, ignored: boolean } = payload;
            const m = state.members[id]
            return {
                ...state,
                members: {
                    ...state.members,
                    [id]: {
                        ...state.members[id],
                        ignored
                    }
                }
            }

        case 'SETMEMBER':
            const key = payload;
            return {
                ...state,
                id: key
            }

        case 'ADDMEMBER':
            const member: Member = payload;

            return {
                ...state,
                members: {
                    ...state.members,
                    [member.id]: {
                        connected: true,
                        ...member,
                        displayname: member.displayname
                    }
                }
            }
        case 'DELMEMBER':
            const membId: string = payload;
            return {
                ...state,
                members: {
                    ...state.members,
                    [membId]: {
                        ...state.members[membId],
                        connected: false
                    }
                }
            }
        case 'RESET':
            return {
                ...state,
                members: {}
            }
        default:
            return state;
    }
}

export const UserContext = React.createContext({
    state: initialState,
    dispatch: (type: ActionType["type"], payload?: any) => { },
    isAdmin:():boolean => true
})

export default function UserProvider({ children }: { children: React.ReactElement }) {
    const [state, dispatch] = useReducer<Reducer<UserState, ActionType>>(UserReducer, initialState)

    const userDispatch = (type: ActionType["type"], payload: any) => {
        dispatch({
            type,
            payload
        })
    }

    const isAdmin = () => state.members[state.id] ? state.members[state.id].admin : false
    

    return (
        <UserContext.Provider
            value={{
                state,
                dispatch:userDispatch,
                isAdmin
            }}>
            {children}
        </UserContext.Provider>
    )
}