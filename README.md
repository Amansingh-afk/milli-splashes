# milli-splashes

Community splash registry for [milli.nvim](https://github.com/amansingh-afk/milli.nvim). Install any splash here straight from Neovim:

```
:MilliBrowse            " list everything
:MilliInstall doomfire  " download + validate + ready to use
:MilliPreview doomfire  " watch it
```

Installed splashes land in `stdpath("data")/milli/splashes/` and work exactly like bundled ones — same `splash = "name"` API, tab-completion included.

## Contributing a splash

1. Make frames with the [milli CLI](https://github.com/Amansingh-afk/milli):

   ```bash
   # from any image or GIF
   milli export mycat.gif ./out -t lua -w 60 --no-bg

   # or generate one procedurally — no source image needed
   milli text "YOLO" -e glitch -o ./out -t lua
   milli shader plasma -w 70 -h 16 -o ./out -t lua
   ```

2. Copy the emitted `.lua` file to `splashes/<name>.lua` (lowercase, `[a-z0-9-_]` only).
3. Add an entry to `index.json` with `name`, `desc`, `author`.
4. Open a PR. Keep files under ~1.5 MB; prefer `-w 80` or narrower so splashes fit dashboards.

Splash files must be **pure data modules** (the exact output of `milli export -t lua`): no `require`, no function calls, no globals. `:MilliInstall` loads candidates in an empty Lua environment and rejects anything that isn't plain frame data.

## License

MIT. By contributing you license your splash under MIT. Only submit content you have the right to share.
