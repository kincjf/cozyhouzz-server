# NODE TODO API
This is a NodeJS full API that you can use to test with your SPAs or Mobile apps.
지정 도메인 : cozyhouzz.co.kr

## How to use it
`npm run [server:dev]`

개발시 : server:dev

배포시 : server:prod

Google Sheet(cozyhouzz_개발자료 : Server-App 통신방법)을 참고 바람.

테스트용 계정을 초기에 자동 생성되게 해서 간단한 로그인 테스트는 가능하다! (bin/www 참고)

구동 후, test route를 이용하여 작동 확인 가능

#### **`!! 꼭 폴더 내부의 파일실행권한 (chmod) 를 바꿔줘야 한다!!!`**


## Available

### Routes

Available methods:

* **GET /api/random**: test route - `index`
* **GET /api/public/file/test**: file upload test - `json data`