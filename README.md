<p align="center">
  <a href="https://talaikis.com/">
    <img alt="Talaikis Ltd." src="https://github.com/TalaikisInc/talaikis.com_react/blob/master/media/logo.png" width="228">
  </a>
</p>

# Users Cubed

This is user management service API, currently storing data only on hosts' disk.

## Features

* Usrr registration, login, edit, destroy
* Same CRUD for tokens
* Minimal referral system
* Account confirmations
* Password reset

## NOTE!

Successor is [User Management System API on S3](https://github.com/TalaikisInc/users-cubed-s3)

## TODO

* Tests
* Unconfirmed (secondary) method confirm?
* More logs
* Move into async/await
* Data caching?
* Security improvements

## Run

```bash
npm i
npm run start
```

## Requirements

* Passwords > 12 chars

## Routes

There is only one '/' route that accepts only POST requests with defined actions. List of actions is listed on Postam collection.

## Database

As default it uses simple json store, dataLLib can be easily configured for any type of database.

## Deployment

Use slave_build.sh and slave_start.sh, data will be mounted on /opt/.data

## Licence

GPL v3.0
