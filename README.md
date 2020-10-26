# d.buzz-message
Private messaging service for d.buzz

**Installation/Setup**
```
> git clone https://github.com/d-buzz/d.buzz-message.git
> npm run init (to create env file)
> npm install
> npm start
> change env SOCKET_ENABLE to "true" for websocket support
```

**API Endpoints**
##### POST /api/v1/auth
User authentication and return JWT (JSON Web Token)
JWT will be used for specific POST requests
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
    "data": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT
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

##### POST /api/v1/auth

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
    "data": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT
    "message": 'Authenticated successfully',
    "code": 200
}
```

##### POST /api/v1/message/send
Send encrypted or non-encrypted memo 
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
    "data": [
        {
            "username": "missdarkstar",
            "online": 0
        }
    ],
    "message": 'Data fetched successfully',
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
Get transfer/message history of FROM and TO accounts
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


