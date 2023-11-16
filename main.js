'use strict';

const {URLSearchParams} = require('node:url');
const fetch = require('node-fetch');
const {XMLParser} = require('fast-xml-parser');
const crypto = require('node:crypto');
const mqtt = require('mqtt');

class fritz2mqtt {

    constructor() {
        this.xmlParser = new XMLParser();

        console.log('started..');

        let mqttClient = mqtt.connect(process.env.MQTT_HOST);

        mqttClient.on('connect', () => {
            mqttClient.subscribe(process.env.MQTT_TOPIC);
            console.log('mqtt subscribed: ', process.env.MQTT_TOPIC)
        });

        mqttClient.on('message', async (topic, message) => {
            let sid = await this.login();

            let msg = message.toString();

            if (!msg) {
                return;
            }

            let payload = JSON.parse(msg);
            payload.sid = sid;

            console.log('handle payload for page: %s', payload.page);

            let dataRequest = await fetch(process.env.FRITZ_HOST + '/data.lua', {method: 'POST', body: new URLSearchParams(payload)});
            let dataText = await dataRequest.text();

            mqttClient.publish(process.env.MQTT_TOPIC + '/' + payload.page, dataText);
            console.info('publish response to: %s (length %d)', process.env.MQTT_TOPIC + '/' + payload.page, dataText.length);
        });
    }

    async login() {
        let challengeResponse = await fetch(process.env.FRITZ_HOST + '/login_sid.lua', {method: 'GET'});
        let challengeXml = await challengeResponse.text();
        let challengeJson = this.xmlParser.parse(challengeXml);

        if (!challengeJson || !challengeJson.SessionInfo.Challenge) {
            console.error('no valid "Challenge" get from %s', process.env.FRITZ_HOST);
        }

        let loginParams = new URLSearchParams();
        loginParams.append('username', process.env.FRITZ_USERNAME);
        loginParams.append('response', this.getLoginChallenge(challengeJson.SessionInfo.Challenge, process.env.FRITZ_PASSWORD));

        let loginResponse = await fetch(process.env.FRITZ_HOST + '/login_sid.lua', {method: 'POST', body: loginParams});
        let loginXml = await loginResponse.text();
        let loginJson = this.xmlParser.parse(loginXml);

        if (!loginJson || !loginJson.SessionInfo.SID) {
            console.error('no valid "SID" get from %s', process.env.FRITZ_HOST);
            return null;
        }

        return loginJson.SessionInfo.SID;
    }

    getLoginChallenge(challenge, password) {
        let challengeSource = challenge + '-' + password;
        let challengeSourceBytes = Buffer.from(challengeSource, 'utf16le')
        let hash = crypto.createHash('md5').update(challengeSourceBytes).digest('hex');
        return challenge + '-' + hash;
    }
}

new fritz2mqtt();
