import moment from 'moment';
import chalk from 'chalk';

export default () => { return chalk.blue('[' + moment().format('HH:mm') + ']'); };