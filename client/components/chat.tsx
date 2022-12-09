import React, { useState } from "react";
import { Pressable, View, StyleSheet, Text, TextInput } from "react-native";
import Drop from "../icons/drop";

const start = "#00e1fd";
const end = "#fc007a"
const randomStr = "Je voyais ton chargeur au niveau de ta tête ptdfrrr"

export default function Chat() {

    const arr = new Array(40).fill({ text: randomStr });
    const randomArr =[{text:"new stuff should be at the bottom" },{text:"i should be the bottomest" }, ...arr];
    console.log(randomArr)
    const [focused, setFocused] = useState(false);

    return (
        <div style={{
            height: "100%",
            width: "34rem",
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            overflow: "hidden",
            display: "flex",
            marginLeft: 0,
            marginRight: 10,
            marginTop: 10,
            borderLeft: "1px solid black",
            backgroundColor: "rgb(20,20,21)",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "column",
            paddingBottom: 20,
        }}>
            <View
                style={styles.chat_header}>
                <Text style={styles.chat_header_text} >STREAM CHAT</Text>
                <Pressable style={styles.icon}>
                    <Drop width={20} height={20} fill={"white"} />
                </Pressable>
            </View>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexDirection: "column-reverse",
                    alignItems: "center",
                    overflowY: "auto",
                    padding: 10,
                    // marginBottom:"3rem"
                }}>
                {
                    randomArr.map((item, id) => {
                            return (
                                <Text
                                    key={`chat-${id}`}
                                    style={styles.chat_text}
                                >{item.text}</Text>
                            )
                        // }
                    })
                }
            </div>
            <View style={{
                height: "3rem",
                width: "100%",
            }}>
                <View style={{
                    // width: "30%",
                    height: "100%",
                    marginHorizontal: 20,
                    marginVertical: 10,
                    borderRadius: 10,
                    overflow: "hidden",
                    //@ts-expect-error
                    backgroundSize: "165%",
                    padding: 1,
                    background: focused ? `linear-gradient(.351turn,${start} 23.71%,${end} 78.8%)` : undefined,
                    border: "2px solid transparent",
                }} >
                    <div style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        borderRadius: 10,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: '500'
                    }}>
                        <TextInput
                            onFocus={() => {
                                setFocused(true)
                            }}
                            onBlur={() => {
                                setFocused(false)
                            }}
                            // multiline
                            // onChangeText={onChange}
                            placeholder={"Send a message"}
                            style={[styles.input, {
                                width: "90%",
                                backgroundColor: focused ? "black" : "rgb(30,30,31)"
                            }]}
                        />
                        <Pressable style={{
                            width: "10%",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: focused ? "black" : "rgb(30,30,31)",
                            height: "100%"
                        }}>
                            <i
                                style={{ color: "white", fontSize: 25 }}
                                className="uil uil-grin" />
                        </Pressable>
                    </div>
                </View>
            </View>
        </div>
    )
};

const styles = StyleSheet.create({
    input: {
        height: "100%",
        justifyContent: "center",
        fontFamily: "Nunito",
        paddingHorizontal: 10,
        color: "white",
        fontSize: 15,
        width: '100%',
        // backgroundColor: "rgb(30,30,31)",
    },
    icon: {
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    chat_header: {
        height: "4rem",
        width: "100%",
        backgroundColor: "rgb(24,24,25)",
        alignItems: "center",
        flexDirection: "row",
        borderBottomColor: "black",
        borderBottomWidth: 0.2,
        justifyContent: "space-between",
        padding: 10,
        paddingHorizontal: 20
    },
    chat_header_text: {
        fontFamily: "Nunito",
        color: "rgb(255,255,255)",
        fontSize: 15,
        fontWeight: "400"
    },
    chat_text: {
        fontFamily: "Nunito",
        color: "rgb(255,255,255)",
        fontSize: 15,
        fontWeight: "400"
    }
})