const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? JSON.stringify(args, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${formattedArgs}`.trim();
  }

  info(message, ...args) {
    const formatted = this.formatMessage('INFO', message, ...args);
    console.log(`${colors.green}${formatted}${colors.reset}`);
  }

  error(message, ...args) {
    const formatted = this.formatMessage('ERROR', message, ...args);
    console.error(`${colors.red}${formatted}${colors.reset}`);
  }

  warn(message, ...args) {
    const formatted = this.formatMessage('WARN', message, ...args);
    console.warn(`${colors.yellow}${formatted}${colors.reset}`);
  }

  debug(message, ...args) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('DEBUG', message, ...args);
      console.log(`${colors.cyan}${formatted}${colors.reset}`);
    }
  }
}

module.exports = new Logger();