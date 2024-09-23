import tls from 'tls';
import WebSocket from 'ws';
import extractJsonFromString from 'extract-json-from-string';
import connect from './node_modules/websocket/browser.js';

const L = "";
const T = "";
const S = "";
const K = "";

const mentalSocket = tls.connect({
    host: "canary.discord.com",
    port: 443,
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
    handshakeTimeout: 1,
    servername: "canary.discord.com"
});

let vanity = {vanity: "",event: null,};
const guilds = {};

mentalSocket.on("data", async (data) => {
    const ext = await extractJsonFromString(data.toString());
    if (!Array.isArray(ext)) {
      console.error("no array", ext);
      return;
    }

    const find = ext && (ext.find((e) => e.code) || ext.find((e) => e.message && e.message.toLowerCase().includes("rate")));
    if (find) {

        const mentalBody = JSON.stringify({
            content: `\n\`\`\`json\n${JSON.stringify(find, null, 2)}\`\`\``,
        });

        const mentalLength = Buffer.byteLength(mentalBody);
        const mentalHeader = [
            `POST /api/v7/channels/${K}/messages HTTP/1.1`,
            "Host: canary.discord.com",
            `Authorization: ${T}`,
            "Content-Type: application/json",
            `Content-Length: ${mentalLength}`,
            "",
            "",
        ].join("\r\n");
        const istek = mentalHeader + mentalBody;
        mentalSocket.write(istek);
    }
});

mentalSocket.on("error", (error) => {console.log(`tls error`, error);});
mentalSocket.on("end", () => {console.log("tls connection closed");});
mentalSocket.on("secureConnect", () => {const websocket = new WebSocket("wss://gateway.discord.gg/");websocket.onclose = (event) => {console.log(`ws connection closed ${event.reason} ${event.code}`);};

    websocket.onmessage = async (message) => {
        const { d, op, t } = JSON.parse(message.data);

        if (t === "GUILD_UPDATE") {
            const find = guilds[d.guild_id];
            if (find && find !== d.vanity_url_code) {
                const mentalBody = JSON.stringify({ code: find });
                const mentalHeader = [
                    `PATCH /api/v7/guilds/${S}/vanity-url HTTP/1.1`,
                    `Host: canary.discord.com`,
                    `Authorization: ${T}`,
                    `Content-Type: application/json`,
                    `Content-Length: ${Buffer.byteLength(mentalBody)}`,
                    "",
                    "",
                ].join("\r\n");
                const istek = mentalHeader + mentalBody;
                mentalSocket.write(istek);
                vanity.vanity = `${find}`;
            }
        } else if (t === "READY") {
            d.guilds.forEach((guild) => {
                if (guild.vanity_url_code) {
                    guilds[guild.id] = guild.vanity_url_code;
                }
            });
            console.log(guilds);
        }

        if (op === 10) {
            websocket.send(JSON.stringify({
                op: 2,
                d: {
                    token: L,
                    connect,
                    intents: 513 << 0,
                    properties: {
                        os: "macOS",
                        browser: "Safari",
                        device: "MacBook Air",
                    },
                },
            }));

setInterval(() => websocket.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);} else if (op === 7) {}};
setInterval(() => {mentalSocket.write("GET / HTTP/1.1\r\nHost: canary.discord.com\r\n\r\n");}, 400);});