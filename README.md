# voice-fe

Public URL: https://voice3.acdh.oeaw.ac.at/

This frontend uses and the [voice-api endpoint](https://voice-api.acdh.oeaw.ac.at/).
The source for this api is avaliable [here](https://github.com/acdh-oeaw/voice-api).
For using your own endpoint have a look at the `.env` file and
create a `.env.local` to override the default settings.
The source code downloads a site notice from ACDH-CH servers when built.
Please adjust that code if you create your own instance.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Test run the production servers

After you ran the build step:
```
npm run start
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
