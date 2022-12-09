import { useContext } from "react";
import { BaseContext } from "../state/base";
import { ChatContext } from "../state/chat";
import { NotificationContext } from "../state/notifications";
import { RemoteContext } from "../state/remote";
import { UserContext } from "../state/user";
import { VideoContext } from "../state/video";
import { EVENT } from "./events"
import { AdminLockResource, MemberDisconnectPayload, MemberListPayload, MemberPayload, SystemInitPayload, SystemMessagePayload } from "./messages";
import { Member } from "./types";

type myKeys = keyof typeof EVENT

type extraFunctions = {
    [id in myKeys]: (r?: any, e?: any) => void;
};

export default function useEventFunctions(id: string) {
    const video = useContext(VideoContext);
    const remote = useContext(RemoteContext);
    const base = useContext(BaseContext);
    const user = useContext(UserContext);
    const chat = useContext(ChatContext);
    const notification = useContext(NotificationContext);

    const cleanUp = () => {
        video.dispatch("RESET")
        base.dispatch("SETCONNECTED", false)
        user.dispatch("RESET")
        chat.dispatch("RESET")
        remote.dispatch("RESET")
    }

    const getMember = (id: string): Member | undefined => {
        return user.state.members[id]
    }
    //@ts-expect-error
    const functions: extraFunctions = {
        "DATA": () => { },
        "MESSAGE": (event: string, payload: any) => {
            console.log('warn', `unhandled websocket event '${event}':`, payload)
        },
        /////////////////////////////
        // Internal Events
        /////////////////////////////
        "CONNECTING": () => {
            base.dispatch("SETCONNECTING")
        },
        "RECONNECTING": (reason?: Error) => {
            console.log("attemtping to reconnect")
        },
        "CONNECTED": () => {
            base.dispatch("SETCONNECTED", true)
            user.dispatch("SETMEMBER", id)

            notification.notify({
                type: "success",
                title: "connected"
            })
        },
        "DISCONNECTED": (reason?: Error) => {
            cleanUp()

            notification.notify({
                type: "error",
                title: "connection disconnected",
                text: reason ? reason.message : undefined
            })
        },
        "TRACK": (event: RTCTrackEvent) => {
            const { track, streams } = event
            if (track.kind === 'audio') {
                return
            }

            video.dispatch('ADDTRACK', [track, streams[0]])
            video.dispatch('SETSTREAM', 0)
        },
        /////////////////////////////
        // System Events
        /////////////////////////////
        "SYSTEM_INIT": ({ implicit_hosting, locks }: SystemInitPayload) => {
            remote.dispatch('SETIMPLICITHOSTING')

            for (const resource in locks) {
                functions["ADMIN_LOCK"]({
                    event: EVENT.ADMIN_LOCK,
                    resource: resource as AdminLockResource,
                    id: locks[resource],
                })
            }
        },
        "SYSTEM_ERROR": ({ title, message }: SystemMessagePayload) => {
            notification.eventify({
                title,
                type: "error",
                text: message
            })
        },
        /////////////////////////////
        // Member Events
        /////////////////////////////
        "MEMBER_DISCONNECTED": ({ id }: MemberDisconnectPayload) => {
            const member = getMember(id);

            if (!member) {
                return;
            }

            chat.newMessage({
                id: member.id,
                content: "diconnected",
                type: 'event',
                created: new Date()
            })
        }
        /////////////////////////////
        // Control Events
        /////////////////////////////
    }


    return {
        cleanUp,
        notification,
        getMember,
        functions,
        user, video, chat, base, remote
    }
}