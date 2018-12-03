# express-skeleton

## Basic Feature
- Use PostgreSQL in Express: [pg](https://github.com/brianc/node-postgres)
- Log Service: [winston](https://github.com/winstonjs/winston)
- Params Validation: [Joi](https://github.com/hapijs/joi)
- Template Engine: [ejs](https://github.com/mde/ejs)
- Mailer Service: [nodemailer](https://nodemailer.com)
- Authenticate User: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)



## Getting Started

```zsh
$ mkdir your-project-name
$ git clone https://github.com/LuceteYang/koa-skeleton.git your-project-name
$ cd your-project-name
$ rm -rf .git && git init
$ cp .env.copy .env
```

```zsh
$ npm install
$ npm start
```

## Init
`Mailer` send when server start
```

// mailer send when server start
if (process.env.NODE_ENV === "production") {
  require("./lib/mailer")
    .serverStart()
    .catch(err => {
      logger.error("sendmailer serverStart error ", err);
    });
}
```
## Logger

- request log

method user url timestamp param timestamp st message


- response log

method status user url timestamp responsetime ip param st level message


![log_sample](./public/images/log_sample.png)





