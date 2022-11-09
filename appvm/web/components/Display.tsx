import React, { useRef, useEffect } from "react";

import loading from "./Loading.svg";

import styles from "../styles/Display.module.scss";

interface DisplayProps {
    streamSrc: MediaStream | null;
    inpChannel: RTCDataChannel | null;
}

export default function Display({ streamSrc, inpChannel }: DisplayProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        // if (!streamSrc) return;
        if (streamSrc && videoRef.current) {
            videoRef.current.srcObject = streamSrc;
        }
    }, [streamSrc]);

    const sendMouseDown = (data: any) => {
        if (!inpChannel) return;

        inpChannel.send(
            JSON.stringify({
                type: "MOUSEDOWN",
                data: JSON.stringify(data),
            })
        );
    };

    const sendMouseUp = (data: any) => {
        if (!inpChannel) return;

        inpChannel.send(
            JSON.stringify({
                type: "MOUSEUP",
                data: JSON.stringify(data),
            })
        );
    };

    const sendMouseMove = (data: any) => {
        if (!inpChannel) return;

        inpChannel.send(
            JSON.stringify({
                type: "MOUSEMOVE",
                data: JSON.stringify(data),
            })
        );
    };

    const isLeftButton = (button: number) => {
        return button === 0 ? 1 : 0; // 1 is right button
    };

    const onMouseDown = (event: any) => {
        if (videoRef.current) {
            const boundRect = videoRef.current.getBoundingClientRect();
            sendMouseDown({
                isLeft: isLeftButton(event.button),
                x: event.clientX - boundRect.left,
                y: event.clientY - boundRect.top,
                width: boundRect.width,
                height: boundRect.height,
            });
        }
    };

    const onMouseUp = (event: any) => {
        if (videoRef.current) {
            const boundRect = videoRef.current.getBoundingClientRect();
            sendMouseUp({
                isLeft: isLeftButton(event.button),
                x: event.clientX - boundRect.left,
                y: event.clientY - boundRect.top,
                width: boundRect.width,
                height: boundRect.height,
            });
        }
    };

    const onMouseMove = (event: any) => {
        if (videoRef.current) {
            const boundRect = videoRef.current.getBoundingClientRect();
            sendMouseMove({
                isLeft: isLeftButton(event.button),
                x: event.clientX - boundRect.left,
                y: event.clientY - boundRect.top,
                width: boundRect.width,
                height: boundRect.height,
            });
        }
    };

    const onContextMenu = (event: any) => {
        event.preventDefault();
        return false;
    };

    return (
        <div className={styles.display}>
            <video
                className={styles.display__video}
                poster={loading}
                ref={videoRef}
                autoPlay
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onContextMenu={onContextMenu}
            />
        </div>
    );
}
