#!/bin/sh

ffmpeg -f lavfi -i color=c=orange@0.2:duration=10:size=200x50:rate=60  orange200x50.mp4;

ffmpeg -f lavfi -i color=c=blue@0.2:duration=10:size=200x50:rate=60  blue200x50.mp4;

ffmpeg -f lavfi -i color=c=brown@0.2:duration=10:size=200x50:rate=60  brown230x50.mp4;