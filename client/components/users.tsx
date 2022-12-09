import React, { useRef, useState } from "react";
import { View, Image, StyleSheet, Pressable, Animated, Text } from "react-native";
import Close from "../icons/close";
import Open from "../icons/open";

const dicebear = "https://avatars.dicebear.com/api/micah/john.svg?background=%23fc007a";
const randomArr = new Array(1).fill(0);

export default function Users() {
    const value = useRef(new Animated.Value(0)).current;
    // const [isOpened, setIsOpened] = useState(false);

    // const openDrawer = (val: number) => Animated.timing(value, {
    //     toValue: val,
    //     duration: 1000,
    //     useNativeDriver: true,
    // }).start();
    
    const openDrawer = (val: number) => {}


    return (
        <div
            style={{
                position: "relative",
                height: "100%",
            }}>
            {/* on closed */}
            <Animated.View style={{
                width: "5rem", //24rem when opened,
                height: "100%",
                opacity: value.interpolate({
                    inputRange: [0, 0.35, 1],
                    outputRange: [1, 0.5, 0]
                })
            }}>

                <div style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "100%",
                    backgroundColor: "rgb(20,20,21)",
                    flexDirection: "column",
                    overflowY: "auto",
                    borderRight: "1px solid black",
                    overflowX: "hidden"
                }}>
                    <Pressable onPress={() => openDrawer(1)} style={styles.icon}>
                        <Close width={20} height={20} fill={"white"} />
                    </Pressable>
                    <View style={{
                        width: "100%", height: "100%", margin: "0.2rem",
                        justifyContent: "flex-start", alignItems: "center"
                    }}>
                        {randomArr.map((i, key) => (
                            <Image
                                key={`img${key}`}
                                source={{ uri: dicebear }}
                                //@ts-ignore
                                style={{
                                    margin: "0.2rem",
                                    height: "2.4rem",
                                    width: "2.4rem",
                                    borderRadius: "1.2rem",
                                }}
                            />
                        ))}
                    </View>
                </div>
            </Animated.View>
            {/* on opened */}
            <Animated.View
                style={{
                    position: "absolute",
                    backgroundColor: "transparent",
                    left: "0%",
                    bottom: 0,
                    height: "100%",
                    zIndex: 30,
                    opacity: value.interpolate({
                        inputRange: [0, 0.2, 1],
                        outputRange: [0, 0, 1]
                    })
                }}
            >
                <Animated.View
                    style={{
                        width: value.interpolate({
                            inputRange: [0, 0.2, 1],
                            outputRange: [0, 80, 300]
                        }),
                        height: "100%"
                    }} >
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        position: "relative",
                        height: "100%",
                        backgroundColor: "rgb(20,20,21)",
                        flexDirection: "column",
                        overflowY: "auto",
                        borderRight: "1px solid black",
                        overflowX: "hidden"
                    }}>
                        <Pressable onPress={() => openDrawer(0)} style={[styles.icon, {
                            // position:"absolute",
                            top: 0,
                            alignSelf: 'flex-end',
                            right: 0,
                            zIndex: 50
                        }]}>
                            <Open width={20} height={20} fill={"white"} />
                        </Pressable>
                        <View style={{
                            width: "100%", height: "100%", //margin: "0.3rem",
                            justifyContent: "flex-start", alignItems: "flex-start",
                            paddingHorizontal: 20
                        }}>
                            {randomArr.map((i, key) => (
                                <View
                                    key={`user-${key}`}
                                    style={{
                                        width: "100%",
                                        justifyContent: "flex-start",
                                        flexDirection: "row",
                                        alignItems: "center"
                                    }}>
                                    <Image
                                        source={{ uri: dicebear }}
                                        //@ts-ignore
                                        style={{
                                            margin: "0.2rem",
                                            height: "2.4rem",
                                            width: "2.4rem",
                                            borderRadius: "1.2rem",
                                        }}
                                    />
                                    <Text style={{
                                        fontFamily: "Nunito",
                                        color: "white",
                                        fontSize: 20,
                                        marginLeft: 10
                                    }}
                                    >Mukami</Text>
                                </View>
                            ))}
                        </View>
                    </div>
                </Animated.View>
            </Animated.View>
        </div>
    )
};

const styles = StyleSheet.create({
    icon: {
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    }
})