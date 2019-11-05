#!/bin/sh

IFS="/"

for nameFile in video-generator/img/*; do

    spitString=${nameFile/-/$IFS}
    spitString=${spitString/-/$IFS}
    spitString=${spitString/./$IFS}

    arrayData=(echo ${spitString})
    arraySize=(echo ${arrayData[5]/x/$IFS})

    ffmpeg -y -framerate 60 \
        -loop 1 \
        -f image2 \
        -s ${arraySize[1]}x${arraySize[2]} \
        -i video-generator/img/${arrayData[4]}-${arrayData[5]}.${arrayData[6]} \
        -t 10  \
        video-generator/res/${arrayData[4]}-${arrayData[5]}.mp4


done
