import React, { useContext, useEffect } from "react";
import { BaseContext } from "../../state/base";
import { ChatContext } from "../../state/chat";
import { NotificationContext } from "../../state/notifications";
import { RemoteContext } from "../../state/remote";
import { UserContext } from "../../state/user";
import { VideoContext } from "../../state/video";
import { get } from "../../utils/localStorage";




export default function useCustomState() {
    const video = useContext(VideoContext);
    const remote = useContext(RemoteContext);
    const base = useContext(BaseContext);
    const user = useContext(UserContext);
    const chat = useContext(ChatContext);

    const hasMacOSKbd = () => {
        return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
    }
    const KeyTable = {
        XK_ISO_Level3_Shift: 0xfe03, // AltGr
        XK_Mode_switch: 0xff7e, // Character set switch
        XK_Control_L: 0xffe3, // Left control
        XK_Control_R: 0xffe4, // Right control
        XK_Meta_L: 0xffe7, // Left meta
        XK_Meta_R: 0xffe8, // Right meta
        XK_Alt_L: 0xffe9, // Left alt
        XK_Alt_R: 0xffea, // Right alt
        XK_Super_L: 0xffeb, // Left super
        XK_Super_R: 0xffec, // Right super
    }

    //@ts-expect-error
    const getKeyMap = (key: number): number => {
        // Alt behaves more like AltGraph on macOS, so shuffle the
        // keys around a bit to make things more sane for the remote
        // server. this method is used by noVNC, RealVNC and TigerVNC
        // (and possibly others).
        if (hasMacOSKbd()) {
            switch (key) {
                case KeyTable.XK_Meta_L:
                    return KeyTable.XK_Control_L
                case KeyTable.XK_Super_L:
                    return KeyTable.XK_Alt_L
                case KeyTable.XK_Super_R:
                    return KeyTable.XK_Super_L
                case KeyTable.XK_Alt_L:
                    return KeyTable.XK_Mode_switch
                case KeyTable.XK_Alt_R:
                    return KeyTable.XK_ISO_Level3_Shift
            }
        } else {
            return key
        }
    }

    const getAdmin = () => {
        return user.isAdmin()
    }

    const getConnected = () => {
        return base.state.connected
    }

    const getConnecting = () => {
        return base.state.connecting
    }

    const getHosting = () => {
        //TODO: work on this
        return true
    }

    const getImplicitHosting = () => {
        return remote.state.implicitHosting
    }

    const getHosted = () => {
        return remote.isHosted()
    }

    const getVolume = () => {
        return video.state.volume
    }

    const getMuted = () => {
        return video.state.muted
    }

    const getStream = () => {
        return video.state.streams[video.state.index]
    }

    const getPlaying = () => {
        return video.state.playing
    }

    const getPlayable = () => {
        return video.state.playable
    }

    const getEmotes = () => {
        return chat.state.emotes
    }

    const getAutoplay = () => {
        return true
    }

    //server side lock
    const getControlLocked = () => {
        return 'control' in base.state.locked && base.state.locked["control"] && !user.isAdmin()
    }

    const getLocked = () => {
        return remote.state.locked || (getControlLocked() && (!getHosting() || !getImplicitHosting()))
    }

    const getScroll = () => {
        return get<number>('scroll', 10)
    }

    const getScrollInvert = () => {
        return get<boolean>('scroll_invert', true)
    }

    const getPip = () => {
        return typeof document.createElement('video').requestPictureInPicture === 'function'
    }

    const getClipboardRead = () => {
        return 'clipboard' in navigator && typeof navigator.clipboard.readText === 'function'
    }

    const getClipboardWrite = () => {
        return 'clipboard' in navigator && typeof navigator.clipboard.writeText === 'function'
    }

    const getClipboard = () => {
        return remote.state.clipboard
    }

    const getWidth = () => {
        return video.state.width
    }

    const getHeight = () => {
        return video.state.height
    }

    const getRate = () => {
        return video.state.rate
    }

    const getVertical = () => {
        return video.state.vertical
    }

    const getHorizontal = () => {
        return video.state.horizontal
    }

    return {
        getAdmin,
        getConnected,
        getConnecting,
        getHosting,
        getImplicitHosting,
        getHosted,
        getVolume,
        getMuted,
        getStream,
        getPlaying,
        getPlayable,
        getEmotes,
        getAutoplay,
        getLocked,
        getScroll,
        getScrollInvert,
        getPip,
        getClipboardRead,
        getClipboardWrite,
        getClipboard,
        getWidth,
        getHeight,
        getRate,
        getVertical,
        getKeyMap,
        getHorizontal,
        video, base, remote, user,
    }
}