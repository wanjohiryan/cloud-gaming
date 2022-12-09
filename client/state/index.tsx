import React, { Dispatch, Reducer } from 'react';
import { useClient } from '../qwantify';
import { get, set } from '../utils/localStorage';
import BaseContextProvider from './base';
import ChatProvider from './chat';
import RemoteProvider from './remote';
import UserProvider from './user';
import VideoProvider from './video';

interface Props {
    children: React.ReactElement;
};

export default function StateManager({ children }: Props) {

return (
    <BaseContextProvider>
        <ChatProvider>
            <UserProvider>
                <VideoProvider>
                    <RemoteProvider>
                        {children}
                    </RemoteProvider>
                </VideoProvider>
            </UserProvider>
        </ChatProvider>
    </BaseContextProvider>
)
}