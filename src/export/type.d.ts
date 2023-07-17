import { MysqlError } from "mysql";

declare namespace BlueBot {
    interface SlackEvent {
        username?: string,
        client_msg_id: string,
        type: string,
        text: string,
        channel: string,
        user: string,
        ts: string,
        team: string,
        blocks: any,
        event_ts: string,
        channel_type: string
    }
    
    interface VoteValue {
        text: {
            type: string,
            text: String,
        },
        value: String,
    }

    interface VoteResult {
        value: string,
        count: number,
        percent: number,
        bar: string
    }

    type BotError =
        "AlreadyExists" | "NotExists" | "Error" | "ParamError" | "UnknownCommand" | "BadRequest" |
        "NoRandomCreated" | "NoValueOnRandom" | "RandomNotExists" | "TooLittleRandomValue" |
        "NoVoteCreated" | "TooLittleCandidate" | "VoteAlreadyStarted" | "CannotModifyVote" | "VoteNotFound" | "VoteIsNotStarted" | "AlreadyVoted" |
        "NoCustomCreated" | "CustomNotFound"
    }

export = BlueBot;