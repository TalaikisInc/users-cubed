# Users Cubed

This is user management service API, currently storing data only on hosts' disk.

## Features

* Usrr registration, login, edit, destroy
* Same CRUDs for tokens
* Minimal referral system
* Account confirmstions
* Password reset

## NOTE!

Improvement work in progress, current will break.

After readd:

```
"husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "lint-staged"
    }
  },
  "lint-staged": {
    "*.(js|jsx|mjs)": [
      "npm run test"
    ]
  },
```

### Main system

* Unconfirmed (secondary) method confirm path
* Phone/ email change - should also change all joined data points
* MOve everything under POST and action pattern
* Ability to easily change first confirm method (finalize remaining)
* More logs
* Move into promises or aync/await

## Run

```bash
npm i
npm run start
```

## Requirements

* Passwords > 12 chars

## Routes

There is only one '/' route that accepts only POST requests with defined actions. List of actions is listed on Postam collection.

## Licence

GPL v3.0
