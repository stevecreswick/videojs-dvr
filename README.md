# VideoJS DVR Controls

A DVR Plugin for Video.js

## Overview

A fork of: https://github.com/facundofernandez/videojs-dvr

This plugin is a fork of videojs-dvr. It adds seeking support to video.js during a live stream.

This plugin does not include any styling of the elements added to the player, so custom CSS needs to be added.

## Installation

```sh
npm install --save videojs-dvr-controls
```

## Usage

```js
import videojs from 'video.js';
import 'videojs-dvr-controls';

const player = videojs('video-player');

player.dvr();
```
