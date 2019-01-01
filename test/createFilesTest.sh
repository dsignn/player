#!/bin/sh

ffmpeg -f lavfi -i color=c=orange@0.2:duration=10:size=200x50:rate=60  res/orange200x50.mp4;

ffmpeg -f lavfi -i color=c=blue@0.2:duration=10:size=200x50:rate=60  res/blue200x50.mp4;

ffmpeg -f lavfi -i color=c=brown@0.2:duration=10:size=200x50:rate=60  test/res/brown230x50.mp4;

ffmpeg -f lavfi -i color=c=green@0.2:duration=10:size=200x50:rate=60  test/res/green230x50.mp4;

ffmpeg -f lavfi -i color=c=red@0.2:duration=10:size=200x50:rate=60  test/res/red200x50.mp4;

ffmpeg -f lavfi -i color=c=purple@0.2:duration=10:size=200x50:rate=60  test/res/purple200x50.mp4;

ffmpeg -f lavfi -i color=c=purple@0.2:duration=10:size=512x70:rate=60  test/res/purple512x70.mp4;7

ffmpeg -f lavfi -i color=c=red@0.2:duration=10:size=256x70:rate=60  test/res/red256x70.mp4;

ffmpeg -framerate 60 -loop 1 -f image2 -s 200x50 -i test/img/f1-200x50.jpg -t 10  test/res/f1-200x50.mp4

ffmpeg -framerate 60 -loop 1 -f image2 -s 200x50 -i test/img/f2-200x50.png -t 10  test/res/f2-200x50.mp4

ffmpeg -framerate 60 -loop 1 -f image2 -s 384x70 -i test/img/i1-384x70.jpg -t 10  test/res/i1-384x70.mp4

ffmpeg -framerate 60 -loop 1 -f image2 -s 384x70 -i test/img/i2-384x70.jpg -t 10  test/res/i2-384x70.mp4

ffmpeg -framerate 60 -loop 1 -f image2 -s 384x70 -i test/img/i3-384x70.jpg -t 10  test/res/i3-384x70.mp4
