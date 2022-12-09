import React, { useEffect, useRef, useState } from "react";
import { Pressable, View, StyleSheet, Image, Text } from "react-native";
import Expand from "../../icons/expand";
import Play from "../../icons/play";
import VolumeOff from "../../icons/volumeOff";
import Gamepad from "../../icons/gamepad";
import GamepadAlt from "../../icons/gamepadAlt";


import GuacamoleKeyboard from "../../utils/guacamole-keyboard";
import useCustomState from "./state";
import { useClient } from "../../qwantify";


//TODO: Multiple gamepad(4max)
//TODO: Mute, unmute & fullscreen & request for gamepad
//TODO: admin: gamepad edit. guest:gamepad lookup
const gpArray = new Array(4).fill(0);

export default function Main() {
    const dicebear = "https://avatars.dicebear.com/api/micah/lady.svg?background=%2300e1fd"
    const keyboard = GuacamoleKeyboard();
    const [focused, setFocused] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [startsMuted, setStartsMuted] = useState(true);
    const [mutedOverlay, setMutedOverlay] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const currentState = useCustomState();
    const client = useClient()
    // const volume = currentState.getVolume()


    // useEffect(() => {
    //     const vol = volume / 100
    //     if (videoRef.current && videoRef.current.volume != vol) {
    //         videoRef.current.volume = volume
    //     }
    // }, [volume])

    const onResize = () => { }

    useEffect(() => {
        containerRef.current?.addEventListener("resize", onResize)
        videoRef.current?.addEventListener("canplaythrough", () => {
            currentState.video.dispatch("SETPLAYABLE", true)
            if (currentState.getAutoplay()) {
                // start as muted due to restrictive browsers autoplay policy
                if (startsMuted && (!document.hasFocus() || !currentState.base.state.active)) {
                    currentState.video.dispatch("SETMUTED", true)
                }
                currentState.video.dispatch("PLAY")
            }
        })

        videoRef.current?.addEventListener('ended', () => {
            currentState.video.dispatch("SETPLAYABLE", false)
        })

        videoRef.current?.addEventListener('error', (event) => {
            console.error(event.error)
            currentState.video.dispatch("SETPLAYABLE", false)
        })

        videoRef.current?.addEventListener('volumechange', (event) => {
            currentState.video.dispatch("SETMUTED", videoRef.current?.muted)
            currentState.video.dispatch("SETVOLUME", videoRef.current!.volume * 100)
        })

        videoRef.current?.addEventListener('playing', () => {
            currentState.video.dispatch("PLAY")
        })

        videoRef.current?.addEventListener('pause', () => {
            currentState.video.dispatch("PAUSE")
        })

        keyboard.onkeydown = (key: number) => {
            if (!currentState.getHosting() || currentState.getLocked()) {
                return true
            }
            client.sendData('keydown', { key: currentState.getKeyMap(key) })
            return false
        }

        keyboard.onkeyup = (key: number) => {
            if (!currentState.getHosting() || currentState.getLocked()) {
                return
            }
            client.sendData('keyup', { key: currentState.getKeyMap(key) })
        }
        //   keyboard.listenTo(this._overlay)
        return () => {
            // this.observer.disconnect()
            currentState.video.dispatch("SETPLAYABLE", false)
            /* Guacamole Keyboard does not provide destroy functions */
        }
    }, [])

    const randomPlayers = new Array(1).fill({
        pfp: dicebear,
        name: 'guacamole'
    })
    //fill an array dynamically depending on it's length
    const filledGamepads: {
        pfp: "string",
        name: string
    }[] | undefined = gpArray.map((i, key) => randomPlayers[key])

    return (
        <div
            ref={containerRef}
            style={{
                height: "100%",
                width: "100%",//testing
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: "column",
                alignItems: "center",
                cursor: "none"
            }}>
            {/* <video ref={videoRef}/> */}
            <View
                style={{
                    backgroundColor: "rgb(30,30,31)",
                    height: 40,
                    marginBottom: 10,
                    paddingHorizontal: 20,
                    //@ts-ignore
                    cursor: "default",
                    borderRadius: 10,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-around"
                }}>
                <Pressable style={styles.button}>
                    {/* 
                            // TODO: play and pause
                    */}
                    <Play fill="white" height={30} width={30} />
                </Pressable>
                <Pressable style={styles.button}>
                    {/* 
                            // TODO: on hover show volume scroller which goes from up(highest) to down(lowest)
                    */}
                    <VolumeOff height={35} width={35} />
                </Pressable>
                <Pressable style={styles.button}>
                    {/* 
                            // TODO: on press request fullscreen
                    */}
                    <Expand fill="white" height={26} width={26} />
                </Pressable>
                <Pressable style={styles.button}>
                    {/* 
                            // TODO: gamepad turns green when i have the gamepad(default for admin), turns red when am denied and grey when inactive 
                    */}
                    <Gamepad
                        //green #39ff14 red #E40D0a greyrgba(255,255,255,0.3)
                        fill="#39ff14" height={35} width={35} />
                </Pressable>
            </View>
            <View style={{
                height: "5rem",//testing,
                width: "100%",
                //@ts-ignore
                cursor: "default",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgb(15,15,16)",
                flexDirection: "row"
            }}>
                {filledGamepads.map((gp, key) => {
                    if (gp && gp.name) {
                        return (
                            <View
                                key={`active-gpd-${key}`}
                                style={styles.gpad}>
                                <View style={{}} >
                                    <GamepadAlt height={"3.8rem"} width={"3.8rem"} />
                                    <View style={{
                                        position: "absolute",
                                        top: 0, right: 0
                                    }}>
                                        <Image
                                            source={{ uri: gp.pfp }}
                                            style={{ height: 24, width: 24, borderRadius: 8 }} />
                                    </View>
                                </View>
                                {/* username must have a max of 10 characters */}
                                <Text numberOfLines={1} style={{ fontSize: 20, color: "white", fontFamily: "Nunito" }}>{gp.name}</Text>
                            </View>
                        )
                    } else {
                        return (
                            <Pressable key={`inactive-gpd-${key}`} style={styles.gpad}>
                                <Gamepad fill="rgba(255,255,255,0.3)" height={"3.8rem"} width={"3.8rem"} />
                            </Pressable>
                        )
                    }
                })}
            </View>
        </div>
    )
};

const styles = StyleSheet.create({
    button: {
        marginRight: 10
    },
    gpad: {
        marginRight: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 7,
        // maxWidth: 70
    }
})

