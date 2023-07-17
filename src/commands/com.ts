import COM_ from './com_';
import COM_RANDOM from './com_rand';
import COM_VOTE from './com_vote';
import COM_CUSTOM from './com_custom';

const Command = Object.assign(COM_, COM_RANDOM, COM_VOTE, COM_CUSTOM);

export default Command;