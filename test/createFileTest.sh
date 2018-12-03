#!/bin/sh

ffmpeg -f lavfi -i color=c=red@0.2:duration=10:size=200x50:rate=60  red200x50.mp4;

ffmpeg -f lavfi -i color=c=green@0.2:duration=10:size=200x50:rate=60  green200x50.mp4;

ffmpeg -f lavfi -i color=c=yellow@0.2:duration=10:size=200x50:rate=60  yellow230x50.mp4;