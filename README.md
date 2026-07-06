# milli-splashes

Community splash registry for [milli.nvim](https://github.com/amansingh-afk/milli.nvim). Install any splash here straight from Neovim:

```
:MilliBrowse            " list everything
:MilliInstall doomfire  " download + validate + ready to use
:MilliPreview doomfire  " watch it
```

Installed splashes land in `stdpath("data")/milli/splashes/` and work exactly like bundled ones — same `splash = "name"` API, tab-completion included.

## Gallery

26 splashes and counting.

<table>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/aiface.gif" width="260"/><br/><code>:MilliInstall aiface</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/attackontitan.gif" width="260"/><br/><code>:MilliInstall attackontitan</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/aurora.gif" width="260"/><br/><code>:MilliInstall aurora</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/badge.gif" width="260"/><br/><code>:MilliInstall badge</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/cactus.gif" width="260"/><br/><code>:MilliInstall cactus</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/catwoman.gif" width="260"/><br/><code>:MilliInstall catwoman</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/chrome.gif" width="260"/><br/><code>:MilliInstall chrome</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/dancer.gif" width="260"/><br/><code>:MilliInstall dancer</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/flyingcat.gif" width="260"/><br/><code>:MilliInstall flyingcat</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/flyingdragon.gif" width="260"/><br/><code>:MilliInstall flyingdragon</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/ididnot.gif" width="260"/><br/><code>:MilliInstall ididnot</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/lighningtornado.gif" width="260"/><br/><code>:MilliInstall lighningtornado</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/lights.gif" width="260"/><br/><code>:MilliInstall lights</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/retrocircle.gif" width="260"/><br/><code>:MilliInstall retrocircle</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/robot.gif" width="260"/><br/><code>:MilliInstall robot</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/shader.gif" width="260"/><br/><code>:MilliInstall shader</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/shadertwo.gif" width="260"/><br/><code>:MilliInstall shadertwo</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/skullone.gif" width="260"/><br/><code>:MilliInstall skullone</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/skullthree.gif" width="260"/><br/><code>:MilliInstall skullthree</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/skulltwo.gif" width="260"/><br/><code>:MilliInstall skulltwo</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/spaceship.gif" width="260"/><br/><code>:MilliInstall spaceship</code></td></tr>
<tr><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/spinner.gif" width="260"/><br/><code>:MilliInstall spinner</code></td><td align="center"><img src="https://raw.githubusercontent.com/amansingh-afk/milli-splashes/main/previews/vibecattwo.gif" width="260"/><br/><code>:MilliInstall vibecattwo</code></td></tr>
</table>

Procedural picks (no preview yet):

- `doomfire` — Classic PSX DOOM fire, 70x14
- `hack-matrix` — HACK revealed by matrix rain
- `milli-fire` — MILLI wordmark burning in procedural fire

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
4. Optionally add a `previews/<name>.gif` screen capture (same basename as the splash) —
   it shows up in the gallery above.
5. Open a PR — CI validates every splash automatically (pure data, frames shape,
   index consistency). Keep new files under ~1.5 MB (some early splashes are larger;
   new ones shouldn't be); prefer `-w 80` or narrower so splashes fit dashboards.

Splash files must be **pure data modules** (the exact output of `milli export -t lua`): no `require`, no function calls, no globals. `:MilliInstall` loads candidates in an empty Lua environment and rejects anything that isn't plain frame data.

## License

MIT. By contributing you license your splash under MIT. Only submit content you have the right to share.
