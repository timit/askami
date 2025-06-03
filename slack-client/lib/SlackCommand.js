const logger = require('./logger.js');

class SlackCommand {
    #type = "";
    #options = [];
    #terms = [];

    getCommandType() {
        const context = '[SlackCommand.getCommandType]';
        logger.debug(`${context}`);
        return this.#type;
    }

    getListOption() {
        const context = '[SlackCommand.getListOption]';
        logger.debug(`${context}`);
        return this.#options[0];
    }

    getCommandTerms() {
        const context = '[SlackCommand.getCommandTerms]';
        logger.debug(`${context}`);
        // return a copy to preserve immutability
        return this.#terms.slice();
    }

    constructor(cmdTxt) {
        const context = '[SlackCommand.constructor]';
        logger.debug(`${context}`);
        logger.debug(`${context} cmdTxt '${cmdTxt}'`);
        if (cmdTxt.indexOf(" ") <= 0) {
            logger.debug(`${context} check true '${cmdTxt.indexOf(" ")}'`);
            //identify type
            this.#type = cmdTxt;
        } else {
            logger.debug(`${context} check false '${cmdTxt.indexOf(" ")}'`);
            //identify type
            this.#type = cmdTxt.substr(0,cmdTxt.indexOf(" "));
            //identify term field
            let termField = cmdTxt.substr(cmdTxt.indexOf(" ")+1, cmdTxt.length);
            logger.debug(`${context} termField '${termField}'`);
            //identify option field
            let optionField = "";
            if (termField.indexOf(",") <= 0) {
                optionField = termField;
            } else {
                optionField = termField.substr(0, termField.indexOf(","));
            }
            logger.debug(`${context} optionField '${optionField}'`);
            //identify options
            let candidates = optionField.split(" ");
            logger.debug(`${context} candidates '${candidates}'`);
            candidates.forEach(i => {
                i.trim();
                if (i.charAt(0)=='-') {
                    this.#options.push(i);
                }
            });
            logger.debug(`${context} options '${this.#options}'`);
            //prime terms
            this.#terms = termField.split(",");
            //scrub options from terms
            this.#options.forEach(i => {
                i.trim();
                logger.debug(`${context} scrubbing option '${i}' from terms ${this.#terms[0]}`);
                this.#terms[0] = this.#terms[0].replace(i,"").trim();
            });
            //remove empty terms
            this.#terms.forEach((item,index) => {
                item.trim();
                if (item.length == 0) {
                    logger.debug(`${context} removing empty term`);
                    this.#terms.splice(index,1);
                }
            });
        }
        logger.debug(`${context} type '${this.#type}'`);
        logger.debug(`${context} options '${this.#options}'`);
        logger.debug(`${context} terms '${this.#terms}'`);
        this.#valid();
    }

    #valid() {
        const context = '[SlackCommand.#valid]';
        logger.debug(`${context}`);
        switch (this.#type) {
          case 'list':
              if (this.#options.length<1) {
                  throw new Error('no list option specified');
                  return false;
              }
              if (this.#options.length>1) {
                  throw new Error(`more than one list option specified ${this.#options.length}: ${this.#options}`);
                  return false;
              }
              if (!['-applications', '-products'].includes(this.#options[0])) {
                  throw new Error(`invalid list option specified: ${this.#options[0]}`);
                  return false;
              }
              if (this.#terms.length>0) {
                  throw new Error('no terms allowed for the list command');
                  return false;
              }
              break;
          case 'search':
              if (!this.#terms.length>0) {
                  throw new Error('no search term(s) specified');
                  return false;
              }
              if (this.#options.length>1) {
                  throw new Error(`more than one list option specified ${this.#options.length}: ${this.#options}`);
                  return false;
              }
              if (this.#options.length==1 && !['-addons','-vendors'].includes(this.#options[0])) {
                  throw new Error(`invalid list option specified: ${this.#options[0]}`);
                  return false;
              }
              break;
          case 'feedback':
              if (!this.#terms.length>0) {
                  throw new Error('no feedback text specified');
                  return false;
              }
              if (!this.#options.length==0) {
                  throw new Error('invalid feedback option specified');
                  return false;
              }
              break;
          case 'help':
              break;
          default:
              throw new Error('invalid command type specified');
        }
        return true;
    };
    
    static help(message) {
        const context = '[SlackCommand.help]';
        logger.debug(`${context}`);
        let blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "AskAMi: get information about Atlassian Marketplace services"
                }
            }
        ];
        if (message) {
            blocks.push(
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `:warning:  _oops... *${message};* please try again. here are some pointers..._`
                    }
                },
                {
                    "type": "divider"
                }
            );
        }
        blocks.push(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "available commands:"
                }
            },



            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/askami search -vendors <vendor-name>` returns all vendors with a name that fuzzy matches the search term(s)."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/askami search -addons <addon-name>` returns all addons with a name that fuzzy matches the search term(s)."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/askami list -applications` returns all applications in the atlassian marketplace."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/askami list -products` returns all products in the atlassian marketplace."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/askami feedback <your-comments>` sends feedback to the AskAMi development team."
                }
            }
        );
        return {
            "response_type": "ephemeral",
        //  "replace_original": "true",
        //  "delete_original": "true",
            "blocks": blocks
        };
    }

}

module.exports = SlackCommand;