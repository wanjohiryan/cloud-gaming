export const EVENT = {
  // Internal Events
  RECONNECTING: 'RECONNECTING',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  TRACK: 'TRACK',
  MESSAGE: 'MESSAGE',
  DATA: 'DATA',

  // Websocket Events
  SYSTEM_INIT: 'SYSTEM_INIT',
  SYSTEM_DISCONNECT: 'SYSTEM_DISCONNECT',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  //signal events
  SIGNAL_OFFER: 'SIGNAL_OFFER',
  SIGNAL_ANSWER: 'SIGNAL_ANSWER',
  SIGNAL_PROVIDE: 'SIGNAL_PROVIDE',
  SIGNAL_CANDIDATE: 'SIGNAL_CANDIDATE',
  //member events
  MEMBER_LIST: 'MEMBER_LIST',
  MEMBER_CONNECTED: 'MEMBER_CONNECTED',
  MEMBER_DISCONNECTED: 'MEMBER_DISCONNECTED',
  //control_events
  CONTROL_LOCKED: 'CONTROL_LOCKED',
  CONTROL_RELEASE: 'CONTROL_RELEASE',
  CONTROL_REQUEST: 'CONTROL_REQUEST',
  CONTROL_REQUESTING: 'CONTROL_REQUESTING',
  CONTROL_CLIPBOARD: 'CONTROL_CLIPBOARD',
  CONTROL_GIVE: 'CONTROL_GIVE',
  CONTROL_KEYBOARD: 'CONTROL_KEYBOARD',
  //chat events
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  CHAT_EMOTE: 'CHAT_EMOTE',
  // SCREEN: {
  //   CONFIGURATIONS: 'screen/configurations',
  //   RESOLUTION: 'screen/resolution',
  //   SET: 'screen/set',
  // },
  // BROADCAST: {
  //   STATUS: 'broadcast/status',
  //   CREATE: 'broadcast/create',
  //   DESTROY: 'broadcast/destroy',
  // },

  //admin events
  ADMIN_BAN: 'ADMIN_BAN',
  ADMIN_KICK: 'ADMIN_KICK',
  ADMIN_LOCK: 'ADMIN_LOCK',
  ADMIN_UNLOCK: 'ADMIN_UNLOCK',
  ADMIN_MUTE: 'ADMIN_MUTE',
  ADMIN_UNMUTE: 'ADMIN_UNMUTE',
  ADMIN_CONTROL: 'ADMIN_CONTROL',
  ADMIN_RELEASE: 'ADMIN_RELEASE',
  ADMIN_GIVE: 'ADMIN_GIVE',
} as const

export type Events = typeof EVENT

export type WebSocketEvents =
  | SystemEvents
  | ControlEvents
  | MemberEvents
  | SignalEvents
  | ChatEvents
  // | ScreenEvents
  // | BroadcastEvents
  | AdminEvents

export type ControlEvents =
  | typeof EVENT.CONTROL_LOCKED
  | typeof EVENT.CONTROL_RELEASE
  | typeof EVENT.CONTROL_REQUEST
  | typeof EVENT.CONTROL_GIVE
  | typeof EVENT.CONTROL_CLIPBOARD
  | typeof EVENT.CONTROL_KEYBOARD

export type SystemEvents = typeof EVENT.SYSTEM_DISCONNECT
export type MemberEvents = typeof EVENT.MEMBER_LIST | typeof EVENT.MEMBER_CONNECTED | typeof EVENT.MEMBER_DISCONNECTED

export type SignalEvents =
  | typeof EVENT.SIGNAL_OFFER
  | typeof EVENT.SIGNAL_ANSWER
  | typeof EVENT.SIGNAL_PROVIDE
  | typeof EVENT.SIGNAL_CANDIDATE

export type ChatEvents = typeof EVENT.CHAT_MESSAGE | typeof EVENT.CHAT_EMOTE
// export type ScreenEvents = typeof EVENT.SCREEN_CONFIGURATIONS | typeof EVENT.SCREEN.RESOLUTION | typeof EVENT.SCREEN.SET

// export type BroadcastEvents =
//   | typeof EVENT.BROADCAST.STATUS
//   | typeof EVENT.BROADCAST.CREATE
//   | typeof EVENT.BROADCAST.DESTROY

export type AdminEvents =
  | typeof EVENT.ADMIN_BAN
  | typeof EVENT.ADMIN_KICK
  | typeof EVENT.ADMIN_LOCK
  | typeof EVENT.ADMIN_UNLOCK
  | typeof EVENT.ADMIN_MUTE
  | typeof EVENT.ADMIN_UNMUTE
  | typeof EVENT.ADMIN_CONTROL
  | typeof EVENT.ADMIN_RELEASE
  | typeof EVENT.ADMIN_GIVE
