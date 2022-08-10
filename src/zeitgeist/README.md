## Configuration

Zeitgeist can be configured with shapez-provided configuration file.

| OS      | Location                                                                      |
| ------- | ----------------------------------------------------------------------------- |
| Windows | `%APPDATA%\shapez.io\saves\modsettings__dengr1065_zeitgeist.json`             |
| Linux   | `~/.local/share/shapez.io/saves/modsettings__dengr1065_zeitgeist.json`        |
| macOS   | `~/Application Support/shapez.io/saves/modsettings__dengr1065_zeitgeist.json` |

Here's how it looks by default:

```json
{
    "pastLevels": 2,
    "futureLevels": 2
}
```

If both of these settings are set to `0`, no HUD will be shown, and Zeitgeist
will only function as a library.

<style>
pre, td code {
    background: #0002;
}

pre, code {
    font-size: 90%;
    word-break: break-all;
}

tr, td {
    border: 1px solid #0002;
    margin: 0.2em;
}
</style>
