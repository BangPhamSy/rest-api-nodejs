Technologies stack
NodeJS
MongoDB
Express
TypeScript
Command remembers
 
Settings

###ESLINT
yarn add eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin -D "husky": { "hooks": { "pre-commit": "yarn lint" } },
tsc --init
"lint": "eslint . --ext .ts",
"lint-and-fix": "eslint . --ext .ts --fix"
###Reference
http://expressjs.com/en/resources/middleware/morgan.html
https://www.typescriptlang.org/tsconfig
https://github.com/winstonjs/winston
https://www.npmjs.com/package/bcryptjs
https://www.npmjs.com/package/class-validator