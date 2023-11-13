# Node.js fritz2mqtt

![](https://img.shields.io/github/license/b2un0/fritz2mqtt.svg)
![](https://img.shields.io/docker/pulls/b2un0/fritz2mqtt.svg)
![](https://img.shields.io/docker/stars/b2un0/fritz2mqtt.svg)
![](https://img.shields.io/docker/image-size/b2un0/fritz2mqtt.svg)
![](https://github.com/b2un0/fritz2mqtt/workflows/container/badge.svg)

With this container, the REST interface of the FRITZ!Box, which is also used by the UI, can be controlled via mqtt

## Use case

In my case, I needed an easy way to turn a Wireguard VPN connection on or off via Home Assistant

sse [home_assistant](./home_assistant) and [examples](./examples)

the response/status will be published to `$MQTT_TOPIC/$calledPaged`, eg. `fritz2mqtt/shareWireguard`

## Docker

```yaml
services:
  fritz2mqtt:
    image: b2un0/fritz2mqtt:latest
    restart: always
    container_name: fritz2mqtt
    network_mode: bridge
    environment:
      FRITZ_HOST: http://192.168.178.1
      FRITZ_USERNAME:
      FRITZ_PASSWORD:
      MQTT_HOST: mqtt://192.168.178.15:1883
      MQTT_TOPIC: fritz2mqtt
```
