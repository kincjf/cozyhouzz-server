# NODE TODO API
This is a NodeJS full API that you can use to test with your SPAs or Mobile apps.
지정 도메인 : cozyhouzz.co.kr

## How to use it
`gulp [--type] [arg] [task]`

개발시 : gulp

배포시 : gulp --type prod production

Google Sheet(cozyhouzz_개발자료 : Server-App 통신방법, Server-Web 작업구성)을 참고 바람.
구동 후, test route를 이용하여 작동 확인 가능

`!! 꼭 파일실행권한 (chmod) 를 바꿔줘야 한다!!!`


## Available

### Routes

Available methods:

* **GET /**: Default route - `index`
* **GET /test**: route test - `json data`


## Authenticate account

If you want, you can run this server for YOUR Auth0 account. For that, you just need to create a `.env` file and set the `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` variables with the information from your account:

````bash
AUTH0_CLIENT_ID=YourClientId
AUTH0_CLIENT_SECRET=YourClientSecret
````