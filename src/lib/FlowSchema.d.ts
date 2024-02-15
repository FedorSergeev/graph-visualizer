interface StateSchema {
    type: "decision" | "process" | "external";
    description?: string;
    properties?: object;
    connectors?: { 
        name: string, 
        to: string,
        properties?: Map<string, any>
    }[]
}

interface FlowSchema {
    apiVerion: string;
    enterState: string;
    terminator: string;
    description?: string;
    properties?: object;
    states: Map<string, StateSchema>
}