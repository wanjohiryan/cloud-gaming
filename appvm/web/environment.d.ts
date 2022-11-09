declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NEXT_PUBLIC_WS_ENDPOINT: string;
        NEXT_PUBLIC_API_ENDPOINT:string;
      }
    }
  }

  export{}