# URL Shortener

App to shorten URLs.

## Development

Use `yarn dev` to run the development server.
This will start both the REST API, along with serving all the pages from NextJS.

## Build

The project can be build with `yarn build`.
As it requires a server, it can be executed with `yarn start`.

## Configuration

The server exposes several configuration options, which can be found in `ContainerConfig`.
All of the following configurations are provided as environment variables.

```sh
// LogLevel can also be provided as an integer [0-5]
LOG_LEVEL: 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
DB_TYPE: 'InMemory' | 'MongoDb'
DB_HOST: string
DB_PORT: int
```

The default configuration is:

```json
{
	"LogLevel": "info",
	"DB_TYPE": "MongoDb",
	"DB_HOST": "localhost",
	"DB_PORT": 27017
}
```

## TODO

- [x] Enable configuration of data store for URLs
- [x] Add linting
- [x] Enable Docker support + docker compose
- [ ] Analytics for how often an url is visited
