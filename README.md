# DBUZZ-MESSAGE

Private messaging service for d.buzz with WebSocket support

## Installation/Setup

```bash
> git clone https://github.com/d-buzz/d.buzz-message.git
> npm run init (to create env file)
> npm install
> npm start
```

## API ENDPOINTS

##### POST /api/v1/auth

User authentication using username and main password.
It will return JWT (JSON Web Token) to be used for specific POST requests.
JWT contains the username and encrypted password to derive the needed keys (active & memo) and will expire after 1 day.

###### Query Parameters JSON

```
{
    "username": string|required,
    "password": string|required
}
```

###### Expected Response JSON

```
{
    "data": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // JWToken
    "message": 'Authenticated successfully',
    "code": 200
}
```

##### GET /api/v1/account/@{username}

Get user account to check if exists or valid

###### Expected Response JSON

```
{
    "data": {
        "id": 1384416,
        "name": "missdarkstar",
        ...
    },
    "message": 'Data fetched successfully',
    "code": 200
}
```

##### POST /api/v1/account/contacts

Get account contacts based on message history

###### Expected Response JSON

```
{
    "data": [
        {
            "username": "johny",
            "online": 1
        },
        {
            "username": "missdarkstar",
            "online": 0
        },
    ],
    "message": 'Data fetched successfully',
    "code": 200
}
```

##### POST /api/v1/message/send

Send message (transfers) in plain text or encrypted format via memo keys
(Authorization header is required containing JWT)

###### Query Parameters JSON

```
{
    "account_from": string|required,
    "account_to": string|required,
    "message": string|required,
    "amount": integer|required,
    "currency": string|required, // default HIVE
    "use_encrypt": integer|required // 1 or 0; Default is 0
}
```

###### Expected Response JSON

```
{
     "data": {
        "id": "cce0c084e426a0f9798d74a201008dmdj...",
        "block_num": 48155089,
        "trx_num": 48,
        "expired": false
    },
    "message": "Message successfully sent",
    "code": 200
}
```

##### POST /api/v1/message/transfers

Get transfer/message history of a specific account
(Authorization header is required containing JWT)

###### Query Parameters JSON

```
{
    "account": string|required
}
```

###### Expected Response JSON

```
{
    "data": [
        {
            "number": 14055,
            "trx_id": "4b77cb3cddc9f7a725a505...",
            "time": "2020-10-15T15:46:18",
            "time_value": 1602776778000,
            "main_user": "missdarkstar",
            "from": "riyuwe",
            "to": "missdarkstar",
            "amount": 0.001,
            "asset": "HIVE",
            "memo": "#555NQs13D5fvisdskdfndfd...",
            "decoded": "# hello how are you :) This is another test"
        }
    ],
    "message": 'Data fetched successfully',
    "code": 200
}
```

##### POST /api/v1/message/transfers-to

Get transfer/message history between 2 accounts
(Authorization header is required containing JWT)

###### Query Parameters JSON

```
{
    "account_from": string|required,
    "account_to": string|required
}
```

###### Expected Response JSON

```
{
    "data": [
        {
            "number": 14055,
            "trx_id": "4b77cb3cddc9f7a725a505...",
            "time": "2020-10-15T15:46:18",
            "time_value": 1602776778000,
            "main_user": "missdarkstar",
            "from": "riyuwe",
            "to": "missdarkstar",
            "amount": 0.001,
            "asset": "HIVE",
            "memo": "#555NQs13D5fvisdskdfndfd...",
            "decoded": "# hello how are you :) This is another test"
        }
    ],
    "message": 'Data fetched successfully',
    "code": 200
}
```

## SOCKET EVENTS
Enable/disable WebSocket support in env "SOCKET_ENABLE".

### chat-list

get account chat lists with messages

###### Query Parameters JSON

```
{
    "token": string|required // JWT
}
```

##### chat-list-response
Success response:
```
{
    "error": false,
    "singleUser": false,
    "chatList": [
        {
            "username": "missdarkstar",
            "online" : 1,
            "messages" : [
                {
                    "number": 14055,
                    "trx_id": "4b77cb3cddc9f7a725a505...",
                    "time": "2020-10-15T15:46:18",
                    "time_value": 1602776778000,
                    "main_user": "missdarkstar",
                    "from": "riyuwe",
                    "to": "missdarkstar",
                    "amount": 0.001,
                    "asset": "HIVE",
                    "memo": "#555NQs13D5fvisdskdfndfd...",
                    "decoded": "# hello how are you :) This is another test"
                }
            ]
        }
    ]
}
```
Error response:
```
{
    "error": true,
    "chatList": [],
    "message": 'user not found',
}
```
### add-message
send message to other user
###### Query Parameters JSON
```
{
    "from": string|required,
    "to": string|required,
    "message": string|required,
    "amount": integer|required,
    "asset": string|required, // default HIVE
}
```
##### add-message-response
Success response:
```
{
    "from": "johny",
    "to": "missdarkstar",
    "message": "This is a test",
    "amount": 0.001,
    "asset": "HIVE", 
}
```
Error response:
```
{
    "error": true,
    "message": "Message sending failed. Something went wrong..."
}
```
### logout
logout user
###### Query Parameters JSON
```
{
    "username": string|required
}
```
##### logout-response
```
{
    "error": false,
    "message": "user successfully logged out",
    "username": "missdarkstar",
}
```
##### chat-list-response
```
{
    "error": false,
    "userDisconnected": true,
    "username": "missdarkstar",
}
```
### disconnect
sending the disconnected user to all socket users.
##### chat-list-response
```
{
    "error": false,
    "userDisconnected": true,
    "username": "missdarkstar",
}
```