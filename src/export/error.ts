import { MysqlError } from "mysql"
import { BotError } from "./type";

function handleError(error: MysqlError | BotError): string {
    if (isMysqlError(error)) {
        switch (error.code) {
            case "ER_DUP_ENTRY":
                return "오류 : 해당 값이 이미 있습니다.";
            case "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR":
                return "오류 : 데이터베이스 연결에 실패하였습니다. 봇 관리자에게 문의하세요.";
            case "ER_NO_REFERENCED_ROW_2":
                return "오류 : 해당하는 개체가 없어 추가할 수 없습니다. 생성 후 진행하세요.";
            case "WARN_DATA_TRUNCATED":
                return "오류 : 해당 값은 허용되지 않습니다. 해당 명령어 도움말을 확인하세요.";
        }
    } else {
        switch (error) {
            case "AlreadyExists":
                return "오류 : 해당 값이 이미 있습니다.";
            case "NotExists":
                return "오류 : 해당 값이 존재하지 않습니다.";
            case "UnknownCommand":
                return "오류 : 잘못된 명령입니다.";
            case "ParamError":
                return "오류 : 매개 변수가 잘못되었습니다.";
            case "BadRequest":
                return "오류 : 잘못된 요청입니다.";
            case "Error":
                return "오류 : 명령을 실행하는 데 문제가 발생하였습니다.";
            case "NoRandomCreated":
                return "생성된 뽑기가 없습니다.";
            case "NoValueOnRandom":
                return "오류 : 해당 뽑기의 내용이 없습니다.";
            case "TooLittleRandomValue":
                return "오류 : 뽑기의 값은 최소 두가지 이상이어야 합니다.";
            case "RandomNotExists":
                return "오류 : 해당 뽑기는 존재하지 않습니다.";
            case "NoVoteCreated":
                return "생성된 투표가 없습니다.";
            case "TooLittleCandidate":
                return "오류 : 후보는 최소 둘 이상이어야 합니다.";
            case "VoteAlreadyStarted":
                return "오류 : 해당 투표는 이미 시작되었습니다.";
            case "VoteNotFound":
                return "오류 : 해당 투표를 찾을 수 없습니다.";
            case "VoteIsNotStarted":
                return "오류 : 해당 투표는 진행중이 아닙니다.";
            case "CannotModifyVote":
                return "오류 : 해당 투표가 진행중이어서 변경할 수 없습니다.";
            case "AlreadyVoted":
                return "오류 : 이미 투표했습니다.";
            case "NoCustomCreated":
                return "오류 : 생성된 커스텀 명령어가 없습니다.";
            case "CustomNotFound":
                return "오류 : 해당 커스텀 명령어가 없습니다.";
        }
    }
    return '';
}

function isMysqlError (error: any):error is MysqlError {
    return error.code !== undefined;
}

export = handleError;