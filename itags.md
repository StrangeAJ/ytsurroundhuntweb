# 🎵 YouTube Audio Itags Compatibility Table

| 🎛️ **Itag** | 📂 **Format** | 🎧 **Codec**         | 📊 **Bitrate** | 🔊 **Channels** | 📱 **Android** (Chrome/Firefox/YouTube/YT Music)               | 🍎 **iOS** (Safari/Chrome/Firefox/YouTube/YT Music)             | 💻 **Windows** (Chrome/Edge/Firefox)                           | 🖥️ **macOS** (Chrome/Safari)                                  |
|-------------|---------------|----------------------|---------------|----------------|-------------------------------------------------------------|----------------------------------------------------------------|----------------------------------------------------------------|---------------------------------------------------------------|
| **256**     | MP4           | AAC (HE v1)          | 192 Kbps      | 5.1 Surround  | ⚠️ Partial (Chrome supports HE-AAC; others may downmix)      | ⚠️ Partial (Safari supports HE-AAC; others may downmix)        | ✅ Supported (Codec availability may vary)                    | ✅ Supported on Safari; Chrome limited                        |
| **258**     | MP4           | AAC (LC)            | 384 Kbps      | 5.1 Surround  | ✅ Chrome and YouTube apps support                           | ✅ Safari supports AAC; others partial                        | ✅ Supported on Chrome, Edge, Firefox                         | ✅ Supported on Safari; Chrome limited                        |
| **325**     | MP4           | DTSE (DTS Express)  | 384 Kbps      | 5.1 Surround  | ❌ Rare support; requires DTS decoder hardware or software   | ❌ Rare support; requires DTS decoder hardware                | ❌ Rarely supported; codec limitations                        | ❌ Rarely supported; codec limitations                        |
| **327**     | MP4           | AAC (LC)            | 256 Kbps      | 5.1 Surround  | ⚠️ Partial: Chrome/YouTube app                              | ✅ Safari/YouTube app supported                               | ✅ Supported                                                 | ✅ Supported                                                 |
| **328**     | MP4           | EAC3                | 384 Kbps      | 5.1 Surround  | ❌ Rare support on Android devices with Dolby Atmos          | ⚠️ Safari may support with Dolby Atmos; Chrome and YouTube limited | ❌ Rare support; codec not widely available                   | ✅ Supported on Safari with Dolby Atmos                       |
| **338**     | WebM          | Opus (VBR)          | ~480 Kbps (?) | Quadraphonic  | ✅ Supported on Chrome/Firefox apps                         | ❌ Limited; Safari does not support Opus                      | ✅ Supported on Chrome/Firefox                                | ❌ Limited on Safari; Chrome supports                         |
| **380**     | MP4           | AC3                 | 384 Kbps      | 5.1 Surround  | ❌ Limited to devices with AC3 codec support                | ⚠️ Safari may support AC3; others may downmix                | ❌ Rarely supported without third-party codec installation    | ✅ Supported in Safari with AC3 codec                         |

---

## 🌟 Notes:

- 🎶 **AAC (LC)** and **AAC (HE v1)** are widely supported but may downmix to stereo on unsupported setups.
- 🎛️ **DTSE**, **EAC3**, and **AC3** require specific hardware/software decoders.
- 💡 **Opus** has limited support on Safari; prefer Chrome/Firefox for full compatibility.
