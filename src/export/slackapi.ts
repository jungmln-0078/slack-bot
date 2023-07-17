import web from '../..';

const slackAPI = {
    getName: async (user: string) => {
        try {
            let result = await web.users.info({ user: user });
            return result.user?.real_name;

        } catch (err) {
            return null;
        }
    },

    message: async (channel: string, text: string, attachments?: string) => {
        try {
            let result = await web.chat.postMessage({ channel: channel, text: text, attachments: [{ text: attachments }] });
            return result;

        } catch (err) {
            console.log(err);
            return null;
        }
    },

    ephemeral: async (user: string, channel: string, text: string, attachments?: string) => {
        try {
            let result = await web.chat.postEphemeral({ channel: channel, text: text, attachments: [{ text: attachments }], user: user });
            return result;

        } catch (err) {
            console.log(err);
            return null;
        }
    },

    block: async (channel: string, text: string, blocks: any, attachments?: string) => {
        try {
            let result = await web.chat.postMessage({ channel: channel, text: text, blocks: blocks, attachments: [{ text: attachments }] });
            return result;

        } catch (err) {
            console.log(err);
            return null;
        }
    },

    update: async (channel: string, ts: string, text: string, blocks?: any) => {
        try {
            let result = blocks ? await web.chat.update({ channel: channel, ts: ts, text: text, blocks: blocks })
                : await web.chat.update({ channel: channel, ts: ts, text: text });
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    delete: async (channel: string, ts: string) => {
        try {
            let result = await web.chat.delete({channel: channel, ts:ts});
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}

export = slackAPI;