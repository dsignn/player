#!/bin/sh

IFS="/"

for nameFile in test/img/*; do

    spitString=${nameFile/-/$IFS}
    spitString=${spitString/./$IFS}

    arrayData=(echo ${spitString})
    arraySize=(echo ${arrayData[4]/x/$IFS})

    ffmpeg -y -framerate 60 \
        -loop 1 \
        -f image2 \
        -s ${arraySize[1]}x${arraySize[2]} \
        -i test/img/${arrayData[3]}-${arrayData[4]}.${arrayData[5]} \
        -t 10  \
        test/res/${arrayData[3]}-${arrayData[4]}.mp4
done