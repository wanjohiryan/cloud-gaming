import React from "react";

import Display from "./Display";

import styles from "../styles/AppPlayer.module.scss";

interface AppPlayerProps {
    videoStream: MediaStream | null;
    inpChannel: RTCDataChannel | null;
    onCloseApp:()=> void;
}

export default function AppPlayer({ videoStream, inpChannel, onCloseApp }:AppPlayerProps) {
    return (
        <div className={styles.app_player}>
            <button className={styles.app_player__close} onClick={onCloseApp}>
                X
            </button>
            <Display streamSrc={videoStream} inpChannel={inpChannel} />
        </div>
    );
}
